import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface DecretoDB {
  Codigo_Area: number;
  Ano_Proceso: number;
  NumeroDecreto: number;
  Fecha: Date;
  Rut: string;
  Nombre: string;
  Monto: number;
  FechaDePago: Date;
  Glosa: string;
  SDF: string;
}

export class RegularizarRepository {
  /*
   6.1. Script de vista previa de registro del decreto de pago a liberar. Modificado para buscar múltiples decretos con filtros opcionales.
   */
  async findDecretos(anio: number, numero: number): Promise<DecretoDB[]> {
    const pool = await connectToDB("titular");
    if (!pool) return [];

    const query = `
      SELECT
        Codigo_Area,
        Ano_Proceso,
        NumeroDecreto,
        Fecha,
        Rut,
        Nombre,
        Monto,
        FechaDePago,
        Glosa,
        SDF
      FROM EncabezadoDecretos
      WHERE (Codigo_Area = 1)
      AND (Ano_Proceso = @AnoProceso)
      AND (NumeroDecreto = @NumeroDecreto)
    `;

    const result = await pool
      .request()
      .input("AnoProceso", sql.Int, anio)
      .input("NumeroDecreto", sql.Int, numero)
      .query(query);

    return result.recordset || [];
  }

  /*6.2. Script que libera el decreto de pago. Sets SDF to 'false'.
   */
  async liberarDecreto(anio: number, numero: number): Promise<boolean> {
    const pool = await connectToDB("titular");
    if (!pool) return false;

    const result = await pool
      .request()
      .input("AnoProceso", sql.Int, anio)
      .input("NumeroDecreto", sql.Int, numero).query(`
        UPDATE EncabezadoDecretos
        SET SDF = 'false'
        WHERE (Codigo_Area = 1)
        AND (Ano_Proceso = @AnoProceso)
        AND (NumeroDecreto = @NumeroDecreto)
      `);

    return result.rowsAffected[0] > 0;
  }

  /*6.3. Script que vuelve decreto de pago a su estado original.Deletes the last state record if appropriate.*/
  async regularizarDecreto(anio: number, numero: number): Promise<boolean> {
    const pool = await connectToDB("titular");
    if (!pool) return false;

    // Aplicación estricta del Script 6.3 del proveedor.
    // El DELETE solo borra si el último estado es 1 (Emisión).
    // El UPDATE siempre cambia el decreto a 'true' (No Liberado / Estado normal).
    const result = await pool
      .request()
      .input("AnoProceso", sql.Int, anio)
      .input("NumeroDecreto", sql.Int, numero).query(`
        DELETE FROM SDF_Estados_Decreto_Historico
        WHERE Id = (
          SELECT MAX(Id)
          FROM SDF_Estados_Decreto_Historico
          WHERE Codigo_Area = 1
          AND Ano_Proceso = @AnoProceso
          AND NumeroDecreto = @NumeroDecreto
        ) and Codigo_Estado = 1;
        
        UPDATE EncabezadoDecretos
        SET SDF = 'true'
        WHERE (Codigo_Area = 1)
        AND (Ano_Proceso = @AnoProceso)
        AND (NumeroDecreto = @NumeroDecreto);
      `);

    return (
      result.rowsAffected &&
      result.rowsAffected.length > 0 &&
      result.rowsAffected[0] > 0
    );
  }

  /*6.4. Historial de estados del decreto.*/
  async findDecretoHistorico(
    anio: number,
    numero: number,
  ): Promise<DecretoHistoricoDB[]> {
    const pool = await connectToDB("titular");
    if (!pool) return [];

    const result = await pool
      .request()
      .input("AnoProceso", sql.Int, anio)
      .input("NumeroDecreto", sql.Int, numero).query(`
        SELECT
          Codigo_Area,
          Ano_Proceso,
          NumeroDecreto,
          Id,
          Codigo_Estado,
          Fecha_Estado,
          Id_Responsable,
          Observacion
        FROM SDF_Estados_Decreto_Historico
        WHERE Codigo_Area = 1
        AND Ano_Proceso = @AnoProceso
        AND NumeroDecreto = @NumeroDecreto
        ORDER BY Id ASC, Fecha_Estado ASC
      `);

    return result.recordset || [];
  }
  /* Busca decretos que están liberados (SDF = 'false') y pendientes de regularizar.Soporta paginación.*/
  async findDecretosLiberados(
    anio: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ decretos: DecretoDB[]; total: number }> {
    const pool = await connectToDB("titular");
    if (!pool) return { decretos: [], total: 0 };

    const offset = (page - 1) * pageSize;

    const query = `
      SELECT
        Codigo_Area,
        Ano_Proceso,
        NumeroDecreto,
        Fecha,
        Rut,
        Nombre,
        Monto,
        FechaDePago,
        Glosa,
        SDF,
        COUNT(*) OVER() AS TotalCount
      FROM EncabezadoDecretos
      WHERE (Codigo_Area = 1)
      AND (Ano_Proceso = @AnoProceso)
      AND (SDF = 'false')
      ORDER BY NumeroDecreto DESC
      OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `;

    const result = await pool
      .request()
      .input("AnoProceso", sql.Int, anio)
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize)
      .query(query);

    const decretos = result.recordset.map((row: any) => {
      const { TotalCount, ...decreto } = row;
      return decreto;
    });

    const total =
      result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;

    return { decretos, total };
  }
}

export interface DecretoHistoricoDB {
  Codigo_Area: number;
  Ano_Proceso: number;
  NumeroDecreto: number;
  Id: number;
  Codigo_Estado: number;
  Fecha_Estado: Date;
  Id_Responsable: string;
  Observacion: string;
}
