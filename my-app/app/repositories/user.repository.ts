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
  nombre_rol: string | null;
  codigo?: string | null;
  fecha_expiracion?: Date | null;
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
        u.id_usuario,
        u.nombre,
        u.usuario,
        u.contraseña,
        u.email,
        u.activo,
        u.id_rol,
        r.nombre_rol
        FROM USUARIO u
        LEFT JOIN [SQL_Interface].[dbo].[rol] r ON r.id_rol = u.id_rol
        WHERE u.email = @email`);
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
        u.id_usuario,
        u.nombre,
        u.usuario,
        u.contraseña,
        u.email,
        u.activo,
        u.id_rol,
        r.nombre_rol
        FROM USUARIO u
        LEFT JOIN [SQL_Interface].[dbo].[rol] r ON r.id_rol = u.id_rol
        WHERE u.usuario = @usuario`);
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
  /* Setear Token */
  async setRecoveryToken(
    email: string,
    token: string,
    expiration: Date,
  ): Promise<void> {
    const pool = await connectToDB("");
    if (!pool) return;

    await pool
      .request()
      .input("email", sql.VarChar(100), email)
      .input("codigo", sql.VarChar(255), token)
      .input("fecha_expiracion", sql.DateTime2, expiration).query(`
        UPDATE USUARIO
        SET codigo = @codigo,
            fecha_expiracion = @fecha_expiracion
        WHERE email = @email
      `);
  }

  /* Verificar Token */
  async findByToken(token: string): Promise<UsuarioDB | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool.request().input("codigo", sql.VarChar(255), token)
      .query(`
        SELECT TOP 1
          id_usuario,
          nombre,
          usuario,
          contraseña,
          email,
          activo,
          id_rol,
          codigo,
          fecha_expiracion
        FROM USUARIO
        WHERE codigo = @codigo
          AND fecha_expiracion > GETDATE()
      `);

    return result.recordset[0] ?? null;
  }

  /* Actualizar contraseña con Token */
  async updatePasswordWithToken(
    idUsuario: string,
    newPasswordHash: string,
  ): Promise<void> {
    const pool = await connectToDB("");
    if (!pool) return;

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, idUsuario)
      .input("contraseña", sql.VarChar, newPasswordHash).query(`
        UPDATE USUARIO
        SET contraseña = @contraseña,
            codigo = NULL,
            fecha_expiracion = NULL
        WHERE id_usuario = @id
      `);
  }
}
