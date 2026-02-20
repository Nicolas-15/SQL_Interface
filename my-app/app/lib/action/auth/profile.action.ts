"use server";

import { protectAction } from "@/app/lib/utils/auth-server";
import { AuthService } from "@/app/services/auth.service";
import { revalidatePath } from "next/cache";

const authService = new AuthService();

export async function updateProfileAction(prevState: any, formData: FormData) {
  try {
    const session = await protectAction("/");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email) {
      return { error: "El email es obligatorio" };
    }

    if (password && password !== confirmPassword) {
      return { error: "Las contraseñas no coinciden" };
    }

    await authService.updateProfile(session.id, email, password);

    revalidatePath("/");
    return { success: true, message: "Perfil actualizado correctamente" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Error al actualizar el perfil" };
  }
}
