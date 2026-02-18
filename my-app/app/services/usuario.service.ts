import sql from "mssql";
import { connectToDB } from "../lib/utils/db-connection";
import { UsuarioRepository } from "../repositories/user.repository";
import { hashPassword } from "../lib/utils/hash";

export interface CrearUsuarioDTO {
  nombre: string;
  usuario: string;
  password: string;
  email: string;
  id_rol?: string | null;
}

export interface ActualizarUsuarioDTO {
  id_usuario: string;
  nombre: string;
  email: string;
  id_rol?: string | null;
  activo: boolean;
}

export class UsuarioService {
  private usuarioRepository = new UsuarioRepository();

  /* Crear usuario con validacion si el email o nombre de usuario ya existe*/
  async crearUsuario(data: CrearUsuarioDTO) {
    const existeEmail = await this.usuarioRepository.findByEmail(data.email);
    if (existeEmail) {
      throw new Error("EMAIL_YA_EXISTE");
    }

    const existeUsername = await this.usuarioRepository.findByUsername(
      data.usuario,
    );
    if (existeUsername) {
      throw new Error("USERNAME_YA_EXISTE");
    }

    const passwordHasheada = hashPassword(data.password);

    const nuevoUsuario = await this.usuarioRepository.createUsuario({
      nombre: data.nombre,
      usuario: data.usuario,
      contraseña: passwordHasheada,
      email: data.email,
      id_rol: data.id_rol ?? null,
    });

    return nuevoUsuario;
  }

  /*Actualizar usuario con validacion de usuario existente*/
  async actualizarUsuario(data: ActualizarUsuarioDTO) {
    const usuario = await this.usuarioRepository.findById(data.id_usuario);
    if (!usuario) {
      throw new Error("USUARIO_NO_EXISTE");
    }

    const pool = await connectToDB("");
    if (!pool) throw new Error("DB_ERROR");

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, data.id_usuario)
      .input("nombre", sql.VarChar, data.nombre)
      .input("email", sql.VarChar, data.email)
      .input("id_rol", sql.UniqueIdentifier, data.id_rol).query(`
        UPDATE usuario
        SET nombre = @nombre,
            email = @email,
            id_rol = @id_rol
        WHERE id_usuario = @id
      `);

    await this.usuarioRepository.setActivo(data.id_usuario, data.activo);
  }

  /*Activar / Desactivar*/
  async cambiarEstado(id_usuario: string, activo: boolean) {
    const usuario = await this.usuarioRepository.findById(id_usuario);
    if (!usuario) {
      throw new Error("USUARIO_NO_EXISTE");
    }

    await this.usuarioRepository.setActivo(id_usuario, activo);
  }

  /*Eliminar usuario — intenta borrado real, si falla por FK desactiva*/
  async eliminarUsuario(id_usuario: string) {
    const usuario = await this.usuarioRepository.findById(id_usuario);
    if (!usuario) {
      throw new Error("USUARIO_NO_EXISTE");
    }

    try {
      await this.usuarioRepository.deleteById(id_usuario);
    } catch {
      // FK constraint (tiene registros de auditoría) → desactivar
      await this.usuarioRepository.setActivo(id_usuario, false);
      throw new Error("USUARIO_DESACTIVADO");
    }
  }
}
