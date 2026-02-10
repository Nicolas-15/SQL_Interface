import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface AuditoriaDB {
  id_auditoria: string;
  id_usuario: string;
  registro: string;
  fecha_cambio: Date;
  descripcion: string;
}

export interface CrearAuditoriaDB {
  id_usuario: string;
  registro: string;
  descripcion: string;
}

export class AuditoriaRepository {

  /* =========================
     Registrar auditoría
  ========================== */
  async createAuditoria(data: CrearAuditoriaDB): Promise<AuditoriaDB> {
    const pool = await connectToDB();
    if (!pool) {
      throw new Error("No se pudo conectar a la base de datos");
    }

    const result = await pool.request()
      .input("idUsuario", sql.UniqueIdentifier, data.id_usuario)
      .input("registro", sql.VarChar, data.registro)
      .input("descripcion", sql.VarChar, data.descripcion)
      .query(`
        INSERT INTO auditoria
          (id_usuario, registro, descripcion)
        OUTPUT
          INSERTED.id_auditoria,
          INSERTED.id_usuario,
          INSERTED.registro,
          INSERTED.fecha_cambio,
          INSERTED.descripcion
        VALUES
          (@idUsuario, @registro, @descripcion)
      `);

    return result.recordset[0];
  }

  /* =========================
     Listar auditoría por usuario
  ========================== */
  async findByUsuario(idUsuario: string): Promise<AuditoriaDB[]> {
    const pool = await connectToDB();
    if (!pool) return [];

    const result = await pool.request()
      .input("idUsuario", sql.UniqueIdentifier, idUsuario)
      .query(`
        SELECT
          id_auditoria,
          id_usuario,
          registro,
          fecha_cambio,
          descripcion
        FROM auditoria
        WHERE id_usuario = @idUsuario
        ORDER BY fecha_cambio DESC
      `);

    return result.recordset;
  }

  /* =========================
     Listar auditoría global
  ========================== */
  async findAll(limit = 100): Promise<AuditoriaDB[]> {
    const pool = await connectToDB();
    if (!pool) return [];

    const result = await pool.request()
      .input("limit", sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          id_auditoria,
          id_usuario,
          registro,
          fecha_cambio,
          descripcion
        FROM auditoria
        ORDER BY fecha_cambio DESC
      `);

    return result.recordset;
  }
}
