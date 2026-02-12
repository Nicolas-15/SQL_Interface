import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";

export interface UsuarioDB {
  id_usuario: string;
  nombre: string;
  usuario: string;
  contraseña: string;
  email: string;
  activo: boolean;
  id_rol: string | null;
}

export interface CrearUsuarioDB {
  nombre: string;
  usuario: string;
  contraseña: string;
  email: string;
}

export class UsuarioRepository {
  /*Busqueda por email */
  async findByEmail(email: string): Promise<UsuarioDB | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool.request().input("email", sql.VarChar(100), email)
      .query(`
        SELECT TOP 1
        id_usuario,
        nombre,
        usuario,
        contraseña,
        email,
        activo,
        id_rol
        FROM USUARIO
        WHERE email = @email`);
    return result.recordset[0] ?? null;
  }

  /*Buscar por username*/
  async findByUsername(username: string): Promise<UsuarioDB | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool
      .request()
      .input("usuario", sql.VarChar(100), username).query(`
        SELECT TOP 1
        id_usuario,
        nombre,
        usuario,
        contraseña,
        email,
        activo,
        id_rol
        FROM USUARIO
        WHERE usuario = @usuario`);
    return result.recordset[0] ?? null;
  }

  /*Buscar por ID*/
  async findById(id: string): Promise<UsuarioDB | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool.request().input("id", sql.UniqueIdentifier, id)
      .query(`
        SELECT TOP 1
          id_usuario,
          nombre,
          usuario,
          contraseña,
          email,
          activo,
          id_rol
        FROM usuario
        WHERE id_usuario = @id
      `);

    return result.recordset[0] ?? null;
  }
  /*Crear Usuario*/
  async createUsuario(data: CrearUsuarioDB): Promise<UsuarioDB> {
    const pool = await connectToDB("");
    if (!pool) {
      throw new Error("No se pudo conectar a la base de datos");
    }

    const result = await pool
      .request()
      .input("nombre", sql.VarChar, data.nombre)
      .input("usuario", sql.VarChar, data.usuario)
      .input("contraseña", sql.VarChar, data.contraseña)
      .input("email", sql.VarChar, data.email).query(`
            INSERT INTO usuario
                (nombre,usuario,contraseña,email)
            OUTPUT
                INSERTED.id_usuario,
                INSERTED.nombre,
                INSERTED.usuario,
                INSERTED.contraseña,
                INSERTED.email,
                INSERTED.activo,
                INSERTED.id_rol
            VALUES
                (@nombre,@usuario,@contraseña,@email)
            `);
    return result.recordset[0];
  }

  /*Activar o Desactivar*/
  async setActivo(idUsuario: string, activo: boolean): Promise<void> {
    const pool = await connectToDB("");
    if (!pool) return;

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, idUsuario)
      .input("activo", sql.Bit, activo).query(`
        UPDATE usuario
        SET activo = @activo
        WHERE id_usuario = @id
        `);
  }
}
