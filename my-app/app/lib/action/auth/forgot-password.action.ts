"use server";

import { AuthService } from "@/app/services/auth.service";

const authService = new AuthService();

export interface ForgotPasswordState {
  success?: boolean;
  message?: string;
  errors?: {
    email?: string[];
  };
}

export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return {
      success: false,
      errors: {
        email: ["Por favor ingrese un correo válido"],
      },
    };
  }

  try {
    await authService.requestPasswordReset(email);
    // Siempre retornamos éxito por seguridad para no revelar si el email existe
    return {
      success: true,
      message:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    };
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return {
      success: false,
      message: "Ocurrió un error al procesar la solicitud. Intente nuevamente.",
    };
  }
}
