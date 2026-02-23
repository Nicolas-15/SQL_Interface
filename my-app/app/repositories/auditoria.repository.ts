import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface AuditoriaDB {
  id_auditoria: string;
  id_usuario: string;
  nombre_usuario?: string | null;
  modulo: string;
  registro: string;
  fecha_cambio: Date;
  descripcion: string;
}

export interface CrearAuditoriaDB {
  id_usuario: string;
  modulo: string;
  registro: string;
  descripcion: string;
}

export class AuditoriaRepository {
  /* Registrar auditoría */
  async createAuditoria(data: CrearAuditoriaDB): Promise<AuditoriaDB> {
    const pool = await connectToDB("");
    if (!pool) {
      throw new Error("No se pudo conectar a la base de datos");
    }

    const result = await pool
      .request()
      .input("idUsuario", sql.UniqueIdentifier, data.id_usuario)
      .input("modulo", sql.VarChar(50), data.modulo || "GENERAL")
      .input("registro", sql.VarChar(100), data.registro)
      .input("descripcion", sql.VarChar(sql.MAX), data.descripcion).query(`
        INSERT INTO auditoria
          (id_usuario, modulo, registro, descripcion)
        OUTPUT
          INSERTED.id_auditoria,
          INSERTED.id_usuario,
          INSERTED.modulo,
          INSERTED.registro,
          INSERTED.fecha_cambio,
          INSERTED.descripcion
        VALUES
          (@idUsuario, @modulo, @registro, @descripcion)
      `);

    return result.recordset[0];
  }

  /*Listar auditoría por usuario*/
  async findByUsuario(idUsuario: string): Promise<AuditoriaDB[]> {
    const pool = await connectToDB("");
    if (!pool) return [];

    const result = await pool
      .request()
      .input("idUsuario", sql.UniqueIdentifier, idUsuario).query(`
        SELECT
          a.id_auditoria,
          a.id_usuario,
          u.nombre as nombre_usuario,
          a.modulo,
          a.registro,
          a.fecha_cambio,
          a.descripcion
        FROM auditoria a
        LEFT JOIN usuario u ON a.id_usuario = u.id_usuario
        WHERE a.id_usuario = @idUsuario
        ORDER BY a.fecha_cambio DESC, a.id_auditoria DESC
      `);

    return result.recordset;
  }

  /*Listar auditoría global con filtros opcionales */
  async findAll(
    filters: { modulo?: string; limit?: number } = {},
  ): Promise<AuditoriaDB[]> {
    const pool = await connectToDB("");
    if (!pool) return [];

    const limit = filters.limit || 200;
    const request = pool.request();
    let query = `SELECT TOP (@limit) 
                  a.id_auditoria, 
                  a.id_usuario, 
                  u.nombre as nombre_usuario,
                  a.modulo, 
                  a.registro, 
                  a.fecha_cambio, 
                  a.descripcion 
                 FROM auditoria a
                 LEFT JOIN usuario u ON a.id_usuario = u.id_usuario`;

    request.input("limit", sql.Int, limit);

    if (filters.modulo && filters.modulo !== "TODOS") {
      request.input("modulo", sql.VarChar, filters.modulo);
      query += " WHERE a.modulo = @modulo";
    }

    query += " ORDER BY a.fecha_cambio DESC, a.id_auditoria DESC";

    const result = await request.query(query);
    return result.recordset;
  }
}
