"use server";

import { AuthService } from "@/app/services/auth.service";
import { headers } from "next/headers";

const authService = new AuthService();

export interface ForgotPasswordState {
  success?: boolean;
  message?: string;
  errors?: {
    email?: string[];
  };
}

import { redirect } from "next/navigation";

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
    // Generar codigo y enviar correo
    await authService.requestPasswordReset(email);
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return {
      success: false,
      message: "Ocurrió un error al procesar la solicitud. Intente nuevamente.",
    };
  }

  // Redirigir a la pagina de restablecimiento de contraseña con el correo prellenado
  redirect(`/login/restablecer-contrasena?email=${encodeURIComponent(email)}`);
}
