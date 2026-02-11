import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface TitularDB {
  id_titular: string;
  nombre: string;
  rut: string;
  id_rol: string;
}

export interface CrearTitularDB {
  nombre: string;
  rut: string;
  id_rol: string;
}

export class TitularRepository {
  async findAll(): Promise<TitularDB[]> {
    const pool = await connectToDB();
    if (!pool) return [];

    const result = await pool.request().query(`
      SELECT t.id_titular, t.nombre, t.rut, r.id_rol
      FROM titular t
      JOIN rol r ON r.id_rol = t.id_rol
    `);

    return result.recordset;
  }

  async findTitularByRol(id_rol: string): Promise<TitularDB | null> {
    const pool = await connectToDB();
    if (!pool) return null;

    const result = await pool
      .request()
      .input("idRol", sql.UniqueIdentifier, id_rol).query(`
        SELECT t.id_titular, t.nombre, t.rut, r.id_rol
        FROM titular t
        JOIN rol r ON r.id_rol = t.id_rol
        WHERE t.id_rol = @idRol
      `);

    return result.recordset[0] || null;
  }

  async createTitular(data: CrearTitularDB): Promise<TitularDB> {
    const pool = await connectToDB();
    if (!pool) throw new Error("No se pudo conectar a la DB");

    const result = await pool
      .request()
      .input("nombre", sql.VarChar, data.nombre)
      .input("rut", sql.VarChar, data.rut)
      .input("idRol", sql.UniqueIdentifier, data.id_rol).query(`
        INSERT INTO titular (nombre, rut, id_rol)
        OUTPUT INSERTED.id_titular, INSERTED.nombre, INSERTED.rut, INSERTED.id_rol
        VALUES (@nombre, @rut, @idRol)
      `);

    return result.recordset[0];
  }

  async changeTitular(data: CrearTitularDB): Promise<TitularDB> {
    const pool = await connectToDB();
    if (!pool) throw new Error("No se pudo conectar a la DB");

    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      await new sql.Request(transaction)
        .input("idRol", sql.UniqueIdentifier, data.id_rol)
        .query(`DELETE FROM titular WHERE id_rol = @idRol`);

      const result = await new sql.Request(transaction)
        .input("nombre", sql.VarChar, data.nombre)
        .input("rut", sql.VarChar, data.rut)
        .input("idRol", sql.UniqueIdentifier, data.id_rol).query(`
          INSERT INTO titular (nombre, rut, id_rol)
          OUTPUT INSERTED.id_titular, INSERTED.nombre, INSERTED.rut, INSERTED.id_rol
          VALUES (@nombre, @rut, @idRol)
        `);

      await transaction.commit();
      return result.recordset[0];
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteByRol(id_rol: string): Promise<void> {
    const pool = await connectToDB();
    if (!pool) throw new Error("No se pudo conectar a la DB");

    await pool
      .request()
      .input("idRol", sql.UniqueIdentifier, id_rol)
      .query(`DELETE FROM titular WHERE id_rol = @idRol`);
  }
}
