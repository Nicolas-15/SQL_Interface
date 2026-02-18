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
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return {
      success: false,
      message: "Token inválido o faltante.",
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
    await authService.resetPassword(token, password);
    return {
      success: true,
      message: "Contraseña actualizada exitosamente.",
    };
  } catch (error: any) {
    if (error.message === "TOKEN_INVALIDO_O_EXPIRADO") {
      return {
        success: false,
        message: "El enlace de recuperación es inválido o ha expirado.",
      };
    }
    console.error("RESET_PASSWORD_ERROR:", error);
    return {
      success: false,
      message: "Error al restablecer la contraseña.",
    };
  }
}
