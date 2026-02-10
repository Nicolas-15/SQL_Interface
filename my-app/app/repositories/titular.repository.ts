import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface TitularDB {
  id_titular: string;
  id_usuario: string;
  id_rol: string;
}

export interface CrearTitularDB {
  id_usuario: string;
  id_rol: string;
}

export class TitularRepository {

  /* =========================
     Obtener titular activo por rol
  ========================== */
  async findTitularByRol(idRol: string): Promise<TitularDB | null> {
    const pool = await connectToDB();
    if (!pool) return null;

    const result = await pool.request()
      .input("idRol", sql.UniqueIdentifier, idRol)
      .query(`
        SELECT TOP 1
          id_titular,
          id_usuario,
          id_rol
        FROM titular
        WHERE id_rol = @idRol
      `);

    return result.recordset[0] ?? null;
  }

  /* =========================
     Crear nuevo titular
  ========================== */
  async createTitular(data: CrearTitularDB): Promise<TitularDB> {
    const pool = await connectToDB();
    if (!pool) {
      throw new Error("No se pudo conectar a la base de datos");
    }

    const result = await pool.request()
      .input("idUsuario", sql.UniqueIdentifier, data.id_usuario)
      .input("idRol", sql.UniqueIdentifier, data.id_rol)
      .query(`
        INSERT INTO titular (id_usuario, id_rol)
        OUTPUT
          INSERTED.id_titular,
          INSERTED.id_usuario,
          INSERTED.id_rol
        VALUES (@idUsuario, @idRol)
      `);

    return result.recordset[0];
  }

  /* =========================
     Eliminar titular por rol
     (para reemplazo)
  ========================== */
  async deleteByRol(idRol: string): Promise<void> {
    const pool = await connectToDB();
    if (!pool) return;

    await pool.request()
      .input("idRol", sql.UniqueIdentifier, idRol)
      .query(`
        DELETE FROM titular
        WHERE id_rol = @idRol
      `);
  }

  /* =========================
     Cambiar titular (atómico)
  ========================== */
  async changeTitular(data: CrearTitularDB): Promise<TitularDB> {
    const pool = await connectToDB();
    if (!pool) {
      throw new Error("No se pudo conectar a la base de datos");
    }

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1️⃣ Eliminar titular actual del rol
      await new sql.Request(transaction)
        .input("idRol", sql.UniqueIdentifier, data.id_rol)
        .query(`
          DELETE FROM titular
          WHERE id_rol = @idRol
        `);

      // 2️⃣ Crear nuevo titular
      const result = await new sql.Request(transaction)
        .input("idUsuario", sql.UniqueIdentifier, data.id_usuario)
        .input("idRol", sql.UniqueIdentifier, data.id_rol)
        .query(`
          INSERT INTO titular (id_usuario, id_rol)
          OUTPUT
            INSERTED.id_titular,
            INSERTED.id_usuario,
            INSERTED.id_rol
          VALUES (@idUsuario, @idRol)
        `);

      await transaction.commit();

      return result.recordset[0];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
