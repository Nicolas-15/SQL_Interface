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
  async requestPasswordReset(email: string, siteUrl?: string): Promise<void> {
    //1) Buscar usuario por email
    const usuario = await this.usuarioRepo.findByEmail(email);
    if (!usuario) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    //2) Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + 60 * 60 * 1000); // 1 hora

    //3) Guardar en BD
    await this.usuarioRepo.setRecoveryToken(email, code, expiration);

    //4) Enviar email
    const { sendVerificationCodeEmail } = await import("../lib/utils/email");
    await sendVerificationCodeEmail(email, code, usuario.nombre);

    //5) Auditoría
    await this.auditoriaRepo.createAuditoria({
      id_usuario: usuario.id_usuario,
      registro: "PASSWORD_RESET_REQUEST",
      descripcion: "Solicitud de recuperación de contraseña (Código)",
    });
  }

  /*Restablecimiento de contraseña con Código*/
  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    //1) Verificar email + código
    const usuario = await this.usuarioRepo.findByEmailAndCode(email, code);
    if (!usuario) {
      throw new Error("CODIGO_INVALIDO_O_EXPIRADO");
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
