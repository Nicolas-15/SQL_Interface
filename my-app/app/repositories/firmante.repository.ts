import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";
import { TitularRepository } from "./titular.repository";

export interface FirmanteDB {
  Codigo_Area: string;
  Tipo_Comprobante: string;
  Orden_Firma: number;
  Id_Firmante: string;
  Rut_Firmante: string;
  Cargo: string;
  Orden_Multiple: number;
}

export class FirmanteRepository {
  /** Consultar titular actual */
  async findTitularActual(): Promise<FirmanteDB | null> {
    // Use correct connection key 'titular' for Guberna
    const pool = await connectToDB("titular");
    if (!pool) return null;

    // Obtener titulares dinámicamente
    const titularRepo = new TitularRepository();
    const titulares = await titularRepo.findAll();

    if (titulares.length === 0) return null;

    // Extract IDs (usuarios) to filter
    const ids = titulares.map((t) => t.usuario);

    const request = pool.request();
    // Create dynamic parameters for IN clause
    ids.forEach((id, index) => {
      request.input(`id${index}`, sql.VarChar, id);
    });
    const paramNames = ids.map((_, index) => `@id${index}`).join(",");

    const result = await request.query(`
      SELECT TOP 1 
        Codigo_Area, 
        Tipo_Comprobante, 
        Orden_Firma, 
        Id_Firmante, 
        Rut_Firmante, 
        Cargo, 
        Orden_Multiple
      FROM [Guberna].[dbo].[SDF_Firmas_Multiples]
      WHERE Id_Firmante IN (${paramNames})
    `);

    return result.recordset[0] || null;
  }

  /** Intercambiar titularidad */
  async intercambiarTitularidad(cargo: string | null): Promise<void> {
    console.log(">>> FirmanteRepository.intercambiarTitularidad START");
    console.log(">>> Cargo recibido:", cargo);

    const pool = await connectToDB("titular");
    if (!pool) throw new Error("No se pudo conectar a la DB");

    // Obtener datos de titulares
    const titularRepo = new TitularRepository();
    const titulares = await titularRepo.findAll();
    const alcalde = titulares.find(
      (t) => t.nombre_rol?.toUpperCase() === "ALCALDE",
    );
    const subrogante = titulares.find((t) => {
      const rol = t.nombre_rol?.toUpperCase() || "";
      return rol.includes("ADMINISTRADO") || rol !== "ALCALDE";
    });

    if (!alcalde || !subrogante) {
      console.error(">>> Error: Titulares no encontrados.", {
        alcalde,
        subrogante,
      });
      throw new Error(
        "No se encontraron los datos de los titulares necesarios",
      );
    }
    console.log(">>> Titular Alcalde:", alcalde);
    console.log(">>> Titular Subrogante:", subrogante);

    const formatRut = (rut: string) => {
      // Eliminar puntos y asegurar formato con guion
      const cleanRut = rut.replace(/\./g, "");
      // Asegurar un 0 al inicio si no lo tiene (ajustar según lógica de negocio si es longitud fija)
      return cleanRut.startsWith("0") ? cleanRut : "0" + cleanRut;
    };

    const rutAlcalde = formatRut(alcalde.rut);
    const rutSubrogante = formatRut(subrogante.rut);

    // Asumiendo que 'usuario' es el 'Id_Firmante' (ej: JJOFRE)
    const idAlcalde = alcalde.usuario;
    const idSubrogante = subrogante.usuario;
    const nombreAlcalde = alcalde.nombre.toUpperCase();
    const nombreSubrogante = subrogante.nombre.toUpperCase();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      console.log(">>> Iniciando TRANSACCION...");

      if (cargo?.toUpperCase() == "ALCALDE") {
        console.log(">>> LOGICA: ALCALDE -> SUBROGANTE");
        const deleteResult = await new sql.Request(transaction).input(
          "rutSubrogante",
          sql.VarChar,
          rutSubrogante,
        ).query(`
          DELETE FROM [Guberna].[dbo].[SDF_Firmas_Subrogante_multiple]
          WHERE Rut_Subrogante = @rutSubrogante;
        `);
        console.log(">>> Delete result:", deleteResult.rowsAffected);

        const updateResult = await new sql.Request(transaction)
          .input("rutSubrogante", sql.VarChar, rutSubrogante)
          .input(
            "cargoSubrogante",
            sql.VarChar,
            subrogante.nombre_rol?.toUpperCase(),
          )
          .input("idSubrogante", sql.VarChar, idSubrogante)
          .input("idAlcalde", sql.VarChar, idAlcalde).query(`
          UPDATE [Guberna].[dbo].[SDF_Firmas_Multiples]
          SET Rut_Firmante=@rutSubrogante, Cargo=@cargoSubrogante, Id_Firmante = @idSubrogante
          WHERE Id_Firmante = @idAlcalde;
        `);
        console.log(
          ">>> Update result (SDF_Firmas_Multiples):",
          updateResult.rowsAffected,
        );

        if (updateResult.rowsAffected[0] === 0) {
          console.warn(
            ">>> ALERTA: No se actualizó ninguna fila en SDF_Firmas_Multiples. Verifique Id_Firmante:",
            idAlcalde,
          );
        }
      } else {
        console.log(">>> LOGICA: SUBROGANTE -> ALCALDE");
        const deleteResult = await new sql.Request(transaction).input(
          "rutSubrogante",
          sql.VarChar,
          rutSubrogante,
        ).query(`
            DELETE FROM [Guberna].[dbo].[SDF_Firmas_Subrogante_multiple]
            WHERE Rut_Subrogante = @rutSubrogante;
          `);
        console.log(
          ">>> Delete result (Pre-Insert):",
          deleteResult.rowsAffected,
        );

        const insertResult = await new sql.Request(transaction)
          .input("idSubrogante", sql.VarChar, idSubrogante)
          .input("rutSubrogante", sql.VarChar, rutSubrogante).query(`
          INSERT INTO [Guberna].[dbo].[SDF_Firmas_Subrogante_multiple]
          (Codigo_Area, Tipo_Comprobante, Orden_Firma, Orden_Subrogante, Id_Subrogante, Rut_Subrogante, Orden_Multiple)
          VALUES
          ('1','6', '3', '1',@idSubrogante,@rutSubrogante,'0'),
          ('1','6', '2', '1',@idSubrogante,@rutSubrogante,'1'),
          ('2','6', '5', '1',@idSubrogante,@rutSubrogante,'0'),
          ('2','6', '4', '1',@idSubrogante,@rutSubrogante,'1'),
          ('3','6', '5', '1',@idSubrogante,@rutSubrogante,'0'),
          ('3','6', '4', '1',@idSubrogante,@rutSubrogante,'1');
        `);
        console.log(
          ">>> Insert result (SDF_Firmas_Subrogante_multiple):",
          insertResult.rowsAffected,
        );

        const updateResult = await new sql.Request(transaction)
          .input("rutAlcalde", sql.VarChar, rutAlcalde)
          .input("cargoAlcalde", sql.VarChar, alcalde.nombre_rol?.toUpperCase()) // 'ALCALDE'
          .input("idAlcalde", sql.VarChar, idAlcalde)
          .input("idSubrogante", sql.VarChar, idSubrogante).query(`
          UPDATE [Guberna].[dbo].[SDF_Firmas_Multiples]
          SET Rut_Firmante=@rutAlcalde, Cargo=@cargoAlcalde, Id_Firmante = @idAlcalde
          WHERE Id_Firmante = @idSubrogante;
        `);
        console.log(
          ">>> Update result (SDF_Firmas_Multiples):",
          updateResult.rowsAffected,
        );

        if (updateResult.rowsAffected[0] === 0) {
          console.warn(
            ">>> ALERTA: No se actualizó ninguna fila en SDF_Firmas_Multiples. Verifique Id_Firmante:",
            idSubrogante,
          );
        }
      }

      await transaction.commit();
      console.log(">>> Intercambio de titularidad COMMIT exitoso.");
    } catch (err) {
      console.error(">>> Error en intercambio:", err);
      await transaction.rollback();
      console.log(">>> Transacción ROLLBACK ejecutada.");
      throw err;
    }
  }
}
