import { UsuarioRepository } from "../repositories/user.repository";
import { AuditoriaRepository } from "../repositories/auditoria.repository";
import { comparePassword } from "../lib/utils/hash";
import { generarJWT } from "../lib/utils/jwt";

export interface LoginInput {
  identificador: string; // email o username
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id_usuario: string;
    nombre: string;
    usuario: string;
    email: string;
    id_rol: string | null;
  };
}

export class AuthService {
  private usuarioRepo = new UsuarioRepository();
  private auditoriaRepo = new AuditoriaRepository();

  /*Login*/
  async login(data: LoginInput): Promise<LoginResponse> {
    const { identificador, password } = data;

    //1) Buscar usuario por email o username
    const usuario = identificador.includes("@")
      ? await this.usuarioRepo.findByEmail(identificador)
      : await this.usuarioRepo.findByUsername(identificador);

    if (!usuario) {
      throw new Error("USUARIO_NO_EXISTE");
    }

    //2) Verificar activo
    if (!usuario.activo) {
      throw new Error("USUARIO_INACTIVO");
    }

    //3) Validar password
    const passwordValida = comparePassword(password, usuario.contraseña);
    if (!passwordValida) {
      throw new Error("CREDENCIALES_INVALIDAS");
    }

    //4) Generar JWT
    const token = generarJWT({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      email: usuario.email,
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol,
    });

    //5) Registrar auditoría
    await this.auditoriaRepo.createAuditoria({
      id_usuario: usuario.id_usuario,
      registro: "LOGIN",
      descripcion: "Inicio de sesión exitoso",
    });

    //6) Retorno de los atributos
    return {
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        email: usuario.email,
        id_rol: usuario.id_rol,
      },
    };
  }
  /*Solicitud de restablecimiento de contraseña*/
  async requestPasswordReset(email: string): Promise<void> {
    //1) Buscar usuario por email
    const usuario = await this.usuarioRepo.findByEmail(email);
    if (!usuario) {
      // Por seguridad, no indicamos si el email existe o no, pero logueamos
      console.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    //2) Generar token y fecha expiración
    const token = crypto.randomUUID();
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + 60 * 60 * 1000); // 1 hora

    //3) Guardar en BD
    await this.usuarioRepo.setRecoveryToken(email, token, expiration);

    //4) Enviar email
    const { sendPasswordResetEmail } = await import("../lib/utils/email");
    await sendPasswordResetEmail(email, token);

    //5) Auditoría
    await this.auditoriaRepo.createAuditoria({
      id_usuario: usuario.id_usuario,
      registro: "PASSWORD_RESET_REQUEST",
      descripcion: "Solicitud de recuperación de contraseña",
    });
  }

  /*Restablecimiento de contraseña*/

  async resetPassword(token: string, newPassword: string): Promise<void> {
    //1) Verificar token
    const usuario = await this.usuarioRepo.findByToken(token);
    if (!usuario) {
      throw new Error("TOKEN_INVALIDO_O_EXPIRADO");
    }

    //2) Hash nueva password
    const { hashPassword } = await import("../lib/utils/hash");
    const hashedPassword = await hashPassword(newPassword);

    //3) Actualizar usuario
    await this.usuarioRepo.updatePasswordWithToken(
      usuario.id_usuario,
      hashedPassword,
    );

    //4) Auditoría
    await this.auditoriaRepo.createAuditoria({
      id_usuario: usuario.id_usuario,
      registro: "PASSWORD_RESET_SUCCESS",
      descripcion: "Contraseña restablecida exitosamente",
    });
  }
}
