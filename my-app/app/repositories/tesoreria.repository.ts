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
          AND Numero_Ingreso = @FolioCaja
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

      await this.auditoriaRepo.createAuditoria({
        id_usuario: idUsuario,
        modulo: "TESORERIA",
        registro: "REVERSO_PAGO_TESORERIA",
        descripcion:
          `Reverso ${tipoReverso} Caja:${numeroCaja} Folio:${folioCaja} RUT:${rut}. ${itemsDesc}.`.substring(
            0,
            2000,
          ),
      });
    } catch (err) {
      try {
        await transaction.rollback();
      } catch {}
      throw err;
    }
  }
}
