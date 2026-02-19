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
  id_rol?: string | null;
}

export interface UpdateUsuarioDB {
  id_usuario: string;
  email?: string;
  contraseña?: string; // Ya hasheada si viene
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
        LEFT JOIN [app_Interface].[dbo].[rol] r ON r.id_rol = u.id_rol
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
        LEFT JOIN [app_Interface].[dbo].[rol] r ON r.id_rol = u.id_rol
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
          u.id_usuario,
          u.nombre,
          u.usuario,
          u.contraseña,
          u.email,
          u.activo,
          u.id_rol,
          r.nombre_rol
        FROM USUARIO u
        LEFT JOIN [app_Interface].[dbo].[rol] r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = @id
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
      .input("email", sql.VarChar, data.email)
      .input("id_rol", sql.UniqueIdentifier, data.id_rol ?? null).query(`
            INSERT INTO usuario
                (nombre,usuario,contraseña,email,id_rol)
            OUTPUT
                INSERTED.id_usuario,
                INSERTED.nombre,
                INSERTED.usuario,
                INSERTED.contraseña,
                INSERTED.email,
                INSERTED.activo,
                INSERTED.id_rol
            VALUES
                (@nombre,@usuario,@contraseña,@email,@id_rol)
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

  /*Buscar id_rol por nombre_rol*/
  async findRolByName(nombreRol: string): Promise<string | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool
      .request()
      .input("nombre_rol", sql.VarChar(100), nombreRol)
      .query(
        "SELECT TOP 1 id_rol FROM [app_Interface].[dbo].[rol] WHERE nombre_rol = @nombre_rol",
      );

    return result.recordset[0]?.id_rol ?? null;
  }

  /*Eliminar usuario de la BD*/
  async deleteById(idUsuario: string): Promise<void> {
    const pool = await connectToDB("");
    if (!pool) return;

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, idUsuario)
      .query("DELETE FROM usuario WHERE id_usuario = @id");
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

  /* Verificar Token (Código de 6 dígitos) + Email */
  async findByEmailAndCode(
    email: string,
    code: string,
  ): Promise<UsuarioDB | null> {
    const pool = await connectToDB("");
    if (!pool) return null;

    const result = await pool
      .request()
      .input("email", sql.VarChar(100), email)
      .input("codigo", sql.VarChar(255), code).query(`
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
        WHERE email = @email
          AND codigo = @codigo
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
  /* Actualizar usuario (Perfil) */
  async updateUsuario(data: UpdateUsuarioDB): Promise<void> {
    const pool = await connectToDB("");
    if (!pool) return;

    const request = pool
      .request()
      .input("id", sql.UniqueIdentifier, data.id_usuario);

    let setClauses: string[] = [];

    if (data.email) {
      request.input("email", sql.VarChar, data.email);
      setClauses.push("email = @email");
    }

    if (data.contraseña) {
      request.input("contraseña", sql.VarChar, data.contraseña);
      setClauses.push("contraseña = @contraseña");
    }

    if (setClauses.length === 0) return;

    const query = `UPDATE USUARIO SET ${setClauses.join(", ")} WHERE id_usuario = @id`;
    await request.query(query);
  }
}
