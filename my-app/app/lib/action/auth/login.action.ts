"use server";

import { cookies } from "next/headers";
import { AuthService } from "@/app/services/auth.service";

const authService = new AuthService();

export interface LoginActionResult {
  success: boolean;
  message?: string;
}

export async function loginAction(
  _: unknown,
  formData: FormData,
): Promise<LoginActionResult> {
  try {
    const identificador = String(formData.get("identificador") || "");
    const password = String(formData.get("password") || "");

    if (!identificador || !password) {
      return {
        success: false,
        message: "Debe completar todos los campos",
      };
    }
    const result = await authService.login({
      identificador,
      password,
    });

    //Guardar JWT en cookie segura
    (await cookies()).set({
      name: "auth_token",
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, //1 hora
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.message) {
        case "USUARIO_NO_EXISTE":
        case "CREDENCIALES_INVALIDAS":
          return {
            success: false,
            message: "Usuario o contraseña incorrectos",
          };
        case "USUARIO_INACTIVO":
          return {
            success: false,
            message: "El usuario se encuentra inactivo",
          };
        default:
          console.error("LOGIN_ERROR:", error.message);
          return {
            success: false,
            message: "Error interno del sistema",
          };
      }
    }

    // Error no estándar
    console.error("LOGIN_ERROR_UNKNOWN:", error);
    return { success: false, message: "Error interno del sistema" };
  }
}
