import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";
import { AuditoriaRepository } from "./auditoria.repository";
import { formatRutForDb } from "../lib/utils/validations";

export interface PagoTesoreriaDB {
  Ano_Proceso: number;
  Codigo_Area: string;
  Orden_Ingreso: number;
  Item_Pago: string;
  Fecha_Emision: Date;
  Fecha_Vencimiento: Date;
  Rut: string;
  Nombre: string;
  Placa_Vehiculo: string;
  Rol_Patente: string;
  Rol_Propiedad: string;
  EmitidoPor: string;
  Fecha_Pago: Date;
  Numero_Caja: number;
  Numero_Ingreso: number;
  Rol: string;
}

export class TesoreriaRepository {
  private auditoriaRepo = new AuditoriaRepository();

  /**
   * Buscar un pago para previsualizar (Script 6.1)
   */
  async findPago(
    numeroCaja: number,
    folioCaja: number,
    rut: string,
    fecha: Date,
  ): Promise<PagoTesoreriaDB[]> {
    const pool = await connectToDB("comun");
    if (!pool) return [];

    const formattedRut = formatRutForDb(rut);

    const result = await pool
      .request()
      .input("NumeroCaja", sql.Int, numeroCaja)
      .input("FolioCaja", sql.Int, folioCaja)
      .input("RutCont", sql.VarChar(20), formattedRut)
      .input("FechaAct", sql.Date, fecha).query(`
        SELECT
          Ano_Proceso,
          Codigo_Area,
          Orden_Ingreso,
          Item_Pago,
          Fecha_Emision,
          Fecha_Vencimiento,
          Rut,
          Nombre,
          Placa_Vehiculo,
          Rol_Patente,
          Rol_Propiedad,
          EmitidoPor,
          Fecha_Pago,
          Numero_Caja,
          Numero_Ingreso,
          Rol
        FROM EncabezadoDeudoresMunicipales
        WHERE Numero_Caja = @NumeroCaja
          AND (Numero_Ingreso = @FolioCaja OR Orden_Ingreso = @FolioCaja)
          AND Rut = @RutCont
          AND CAST(Fecha_Pago AS DATE) = @FechaAct;
      `);

    return result.recordset;
  }

  /**
   * Reversar el pago (Script 6.2)
   */
  async reversarPago(
    numeroCaja: number,
    folioCaja: number,
    rut: string,
    fecha: Date,
    idUsuario: string,
    items?: { orden: number; item: string }[],
  ): Promise<void> {
    const pool = await connectToDB("comun");
    if (!pool) throw new Error("Error de conexión a BD Comun");

    //Obtener datos antes de borrar para auditoría
    const pagos = await this.findPago(numeroCaja, folioCaja, rut, fecha);
    if (!pagos || pagos.length === 0) {
      throw new Error("El pago no existe o ya fue reversado.");
    }

    // Filtrar pagos si se pasaron items específicos
    const pagosAReversar = items
      ? pagos.filter((p) =>
          items.some(
            (i) => i.orden === p.Orden_Ingreso && i.item === p.Item_Pago,
          ),
        )
      : pagos;

    if (pagosAReversar.length === 0) {
      throw new Error("No hay registros coincidentes para reversar.");
    }

    const formattedRut = formatRutForDb(rut);

    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      if (items && items.length > 0) {
        for (const item of items) {
          await new sql.Request(transaction)
            .input("NumeroCaja", sql.Int, numeroCaja)
            .input("FolioCaja", sql.Int, folioCaja)
            .input("RutCont", sql.VarChar(20), formattedRut)
            .input("FechaAct", sql.Date, fecha)
            .input("OrdenIngreso", sql.Int, item.orden)
            .input("ItemPago", sql.VarChar(20), String(item.item)).query(`
              UPDATE EncabezadoDeudoresMunicipales
              SET
                Fecha_Pago = NULL,
                Numero_Caja = NULL,
                Numero_Ingreso = NULL
              WHERE Numero_Caja = @NumeroCaja
                AND Numero_Ingreso = @FolioCaja
                AND Rut = @RutCont
                AND CAST(Fecha_Pago AS DATE) = @FechaAct
                AND Orden_Ingreso = @OrdenIngreso
                AND Item_Pago = @ItemPago;
            `);
        }
      } else {
        const result = await new sql.Request(transaction)
          .input("NumeroCaja", sql.Int, numeroCaja)
          .input("FolioCaja", sql.Int, folioCaja)
          .input("RutCont", sql.VarChar(20), formattedRut)
          .input("FechaAct", sql.Date, fecha).query(`
            UPDATE EncabezadoDeudoresMunicipales
            SET
              Fecha_Pago = NULL,
              Numero_Caja = NULL,
              Numero_Ingreso = NULL
            WHERE Numero_Caja = @NumeroCaja
              AND Numero_Ingreso = @FolioCaja
              AND Rut = @RutCont
              AND CAST(Fecha_Pago AS DATE) = @FechaAct;
          `);

        if (result.rowsAffected[0] === 0) {
        }
      }

      await transaction.commit();

      const tipoReverso = items ? "PARCIAL" : "TOTAL";

      const itemsDesc = items
        ? `Items: ${items.map((i) => `${i.orden}/${i.item}`).join(", ")}`
        : "Folio Completo";

      // Guardar el listado de pagos con sus datos originales como JSON para poder restaurarlos
      // La columna descripcion de la BD tiene límite aparentemente de 2000 caracteres.
      let pagosAGuardar = pagosAReversar.map((p) => ({
        NC: p.Numero_Caja,
        NI: p.Numero_Ingreso,
        FP: p.Fecha_Pago,
        OI: p.Orden_Ingreso,
        IP: p.Item_Pago != null ? String(p.Item_Pago).trim() : "",
        R: p.Rut != null ? String(p.Rut).trim() : "",
      }));

      let mensajeBase =
        `Reverso ${tipoReverso} Caja:${numeroCaja} Folio:${folioCaja} RUT:${rut}. ${itemsDesc}.`.substring(
          0,
          150,
        );

      let datosAuditoria: any = {
        m: mensajeBase,
        d: pagosAGuardar,
      };

      let jsonStr = JSON.stringify(datosAuditoria);

      // Algoritmo de reducción segura de JSON para no sobrepasar el campo Varchar (2000 estricto aprox)
      while (jsonStr.length > 2000 && pagosAGuardar.length > 1) {
        pagosAGuardar.pop();
        datosAuditoria.d = pagosAGuardar;
        datosAuditoria.trunc = true;
        jsonStr = JSON.stringify(datosAuditoria);
      }

      // Caída de seguridad absoluta si 1 solo registro supera limite
      if (jsonStr.length > 2000) {
        jsonStr = jsonStr.substring(0, 2000);
      }

      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuario,
        modulo: "TESORERIA",
        registro: "REVERSO_PAGO_TESORERIA",
        descripcion: jsonStr,
      });
    } catch (err) {
      try {
        await transaction.rollback();
      } catch {}
      throw err;
    }
  }

  /**
   * Obtiene los items de todos los reversos realizados por el usuario en el día actual.
   */
  async getUltimoReverso(idUsuario: string): Promise<any[] | null> {
    const auditorias = await this.auditoriaRepo.findByUsuario(idUsuario);

    const checkDate = new Date();
    // Ajustar zona horaria si fuera necesario, usando la fecha local
    const hoyStr =
      checkDate.getFullYear() +
      "-" +
      String(checkDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(checkDate.getDate()).padStart(2, "0");

    const reversosHoy = auditorias.filter((a) => {
      if (a.registro !== "REVERSO_PAGO_TESORERIA") return false;
      const d = new Date(a.fecha_cambio);
      const aStr =
        d.getUTCFullYear() +
        "-" +
        String(d.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getUTCDate()).padStart(2, "0");
      const localStr =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      return localStr === hoyStr || aStr === hoyStr;
    });

    if (reversosHoy.length === 0) return null;

    let todosLosPagos: any[] = [];

    for (const rev of reversosHoy) {
      try {
        const datosAuditoria = JSON.parse(rev.descripcion);
        const pagosOriginales =
          datosAuditoria.d || datosAuditoria.datosOriginales;
        if (
          pagosOriginales &&
          Array.isArray(pagosOriginales) &&
          pagosOriginales.length > 0
        ) {
          const horaRev = new Date(rev.fecha_cambio).toLocaleTimeString(
            "es-CL",
            {
              timeZone: "America/Santiago",
              hour: "2-digit",
              minute: "2-digit",
            },
          );
          todosLosPagos.push(
            ...pagosOriginales.map((p) => ({ ...p, HoraReverso: horaRev })),
          );
        }
      } catch (e) {
        continue;
      }
    }

    if (todosLosPagos.length === 0) return null;

    // Filter by checking DB if they are actually reversed (Fecha_Pago IS NULL)
    const pool = await connectToDB("comun");
    if (pool) {
      try {
        let validPagos: any[] = [];
        // Chunk sizes of 500 items max (each takes 2 config params; max is 2100)
        const chunkSize = 500;
        for (let i = 0; i < todosLosPagos.length; i += chunkSize) {
          const chunk = todosLosPagos.slice(i, i + chunkSize);
          const request = pool.request();

          let conditions: string[] = [];
          for (let j = 0; j < chunk.length; j++) {
            const p = chunk[j];
            conditions.push(
              `(Orden_Ingreso = @oi${i}_${j} AND Item_Pago = @ip${i}_${j})`,
            );
            request.input(`oi${i}_${j}`, sql.Int, p.OI ?? p.Orden_Ingreso);
            request.input(
              `ip${i}_${j}`,
              sql.VarChar(20),
              String(p.IP ?? p.Item_Pago),
            );
          }

          const query = `
            SELECT Orden_Ingreso, Item_Pago
            FROM EncabezadoDeudoresMunicipales
            WHERE Fecha_Pago IS NULL
            AND (${conditions.join(" OR ")})
          `;

          const result = await request.query(query);
          const reversedMap = new Set(
            result.recordset.map(
              (r) => `${r.Orden_Ingreso}-${String(r.Item_Pago).trim()}`,
            ),
          );

          for (const p of chunk) {
            const OI = p.OI ?? p.Orden_Ingreso;
            const IP = String(p.IP ?? p.Item_Pago).trim();
            if (reversedMap.has(`${OI}-${IP}`)) {
              validPagos.push(p);
            }
          }
        }
        todosLosPagos = validPagos;
      } catch (e) {
        console.error("Error validando items reversados en DB:", e);
      }
    }

    if (todosLosPagos.length === 0) return null;

    return todosLosPagos;
  }

  /**
   * Deshacer el último reverso realizado por el usuario (Botón de Emergencia)
   */
  async deshacerUltimoReverso(
    idUsuario: string,
    itemsToRestore?: { OI: number; IP: string; NC: number; NI: number }[],
  ): Promise<void> {
    // 1. Buscar registros de auditoría de este usuario para REVERSO_PAGO_TESORERIA del día actual
    const auditorias = await this.auditoriaRepo.findByUsuario(idUsuario);
    const checkDate = new Date();
    const hoyStr =
      checkDate.getFullYear() +
      "-" +
      String(checkDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(checkDate.getDate()).padStart(2, "0");

    const reversosHoy = auditorias.filter((a) => {
      if (a.registro !== "REVERSO_PAGO_TESORERIA") return false;
      const d = new Date(a.fecha_cambio);
      const aStr =
        d.getUTCFullYear() +
        "-" +
        String(d.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getUTCDate()).padStart(2, "0");
      const localStr =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      return localStr === hoyStr || aStr === hoyStr;
    });

    if (reversosHoy.length === 0) {
      throw new Error(
        "No se encontraron reversos durante este día para deshacer.",
      );
    }

    // 2. Extraer y parsear los datos originales de todos los reversos del día
    let pagosOriginales: any[] = [];
    for (const rev of reversosHoy) {
      try {
        const datosAuditoria = JSON.parse(rev.descripcion);
        const pagos = datosAuditoria.d || datosAuditoria.datosOriginales;
        if (pagos && Array.isArray(pagos) && pagos.length > 0) {
          pagosOriginales.push(...pagos);
        }
      } catch (e) {
        continue;
      }
    }

    if (pagosOriginales.length === 0) {
      throw new Error(
        "No se encontraron los datos originales en los registros de auditoría.",
      );
    }

    // 3. Restaurar los pagos
    const pool = await connectToDB("comun");
    if (!pool) throw new Error("Error de conexión a BD Comun");

    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      for (const pago of pagosOriginales) {
        // Soporte de mapeo para propiedades cortas vs largas
        const NC = pago.NC ?? pago.Numero_Caja;
        const NI = pago.NI ?? pago.Numero_Ingreso;
        const FP = pago.FP ?? pago.Fecha_Pago;
        const OI = pago.OI ?? pago.Orden_Ingreso;
        const IP = pago.IP ?? pago.Item_Pago;
        const R = pago.R ?? pago.Rut;

        if (itemsToRestore && itemsToRestore.length > 0) {
          const isSelected = itemsToRestore.some(
            (i) => i.OI === OI && i.IP === IP && i.NC === NC && i.NI === NI,
          );
          if (!isSelected) continue;
        }

        const result = await new sql.Request(transaction)
          .input("NumeroCajaOriginal", sql.Int, NC)
          .input("FolioCajaOriginal", sql.Int, NI)
          .input("FechaPagoOriginal", sql.DateTime, new Date(FP))
          .input("OrdenIngreso", sql.Int, OI)
          .input("ItemPago", sql.VarChar(20), String(IP))
          .input("RutCont", sql.VarChar(20), formatRutForDb(R)).query(`
            UPDATE EncabezadoDeudoresMunicipales
            SET
              Fecha_Pago = @FechaPagoOriginal,
              Numero_Caja = @NumeroCajaOriginal,
              Numero_Ingreso = @FolioCajaOriginal
            WHERE 
              Orden_Ingreso = @OrdenIngreso
              AND Item_Pago = @ItemPago
              AND Rut = @RutCont
              AND Fecha_Pago IS NULL; -- Asegurarse de que esté anulado
          `);
      }

      await transaction.commit();

      // 4. Registrar la restauración en auditoría
      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuario,
        modulo: "TESORERIA",
        registro: "RESTAURACION_PAGO_EMERGENCIA",
        descripcion: `Restauración de emergencia ejecutada para ${itemsToRestore ? itemsToRestore.length : "varios"} items.`,
      });
    } catch (err) {
      try {
        await transaction.rollback();
      } catch {}
      throw err;
    }
  }
}
