"use server";

import { AuthService } from "@/app/services/auth.service";

const authService = new AuthService();

export interface ResetPasswordState {
  success?: boolean;
  message?: string;
  errors?: {
    password?: string[];
    confirmPassword?: string[];
  };
}

export async function resetPasswordAction(
  prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !code) {
    return {
      success: false,
      message: "Faltan datos requeridos (email o código).",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      errors: { password: ["La contraseña debe tener al menos 6 caracteres"] },
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      errors: { confirmPassword: ["Las contraseñas no coinciden"] },
    };
  }

  try {
    await authService.resetPassword(email, code, password);
    return {
      success: true,
      message: "Contraseña actualizada exitosamente.",
    };
  } catch (error: any) {
    if (error.message === "CODIGO_INVALIDO_O_EXPIRADO") {
      return {
        success: false,
        message: "El código es inválido o ha expirado.",
      };
    }
    console.error("RESET_PASSWORD_ERROR:", error);
    return {
      success: false,
      message: "Error al restablecer la contraseña.",
    };
  }
}
