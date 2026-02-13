import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface TitularDB {
  id_titular: string;
  nombre: string;
  rut: string;
  id_rol: string;
  usuario: string;
  esTitular: boolean;
  nombre_rol: string;
}

export interface CrearTitularDB {
  nombre: string;
  rut: string;
  id_rol: string;
  usuario: string;
  esTitular: boolean;
}

/*Listar a todos los titulares */
export class TitularRepository {
  async findAll(): Promise<TitularDB[]> {
    const pool = await connectToDB("");
    if (!pool) return [];

    const result = await pool.request().query(`
      SELECT t.id_titular, t.nombre, t.rut, r.id_rol, t.usuario, t.esTitular, r.nombre_rol
      FROM [SQL_Interface].[dbo].[titular] t
      JOIN [SQL_Interface].[dbo].[rol] r ON r.id_rol = t.id_rol
    `);

    return result.recordset;
  }
  /*Listar titular por rol */
  async findTitularByRol(id_rol: string): Promise<TitularDB | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool
      .request()
      .input("idRol", sql.UniqueIdentifier, id_rol).query(`
        SELECT t.id_titular, t.nombre, t.rut, r.id_rol, t.usuario, t.esTitular, r.nombre_rol
        FROM [SQL_Interface].[dbo].[titular] t
        JOIN [SQL_Interface].[dbo].[rol] r ON r.id_rol = t.id_rol
        WHERE t.id_rol = @idRol
      `);

    return result.recordset[0] || null;
  }

  /*Modificar el titular*/
  async changeTitular(data: CrearTitularDB): Promise<TitularDB> {
    const pool = await connectToDB("");
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
        .input("idRol", sql.UniqueIdentifier, data.id_rol)
        .input("usuario", sql.VarChar, data.usuario)
        .input("esTitular", sql.Bit, data.esTitular ?? 0).query(`
          INSERT INTO titular (nombre, rut, id_rol, usuario, esTitular)
          OUTPUT INSERTED.id_titular, INSERTED.nombre, INSERTED.rut, INSERTED.id_rol, INSERTED.usuario
          VALUES (@nombre, @rut, @idRol, @usuario, @esTitular)
        `);

      await transaction.commit();
      return result.recordset[0];
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
