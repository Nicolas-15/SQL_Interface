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
      usuario: usuario.usuario,
      email: usuario.email,
      id_rol: usuario.id_rol,
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
}
