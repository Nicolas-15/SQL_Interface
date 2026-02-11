"use server";

import { UsuarioService } from "@/app/services/usuario.service";
import { revalidatePath } from "next/cache";

const usuarioService = new UsuarioService();

export async function eliminarUsuarioAction(id: string) {
  try {
    await usuarioService.eliminarUsuario(id);
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: unknown) {
    console.error("ERROR DELETE:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Error inesperado al eliminar" };
  }
}

export async function crearUsuarioAction(formData: FormData) {
  try {
    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    const usuario = email;
    const password = "123456";

    await usuarioService.crearUsuario({
      nombre,
      usuario,
      email,
      password,
    });

    revalidatePath("/usuarios");

    return { success: true };
  } catch (error: unknown) {
    console.error("ERROR SERVER:", error);

    if (error instanceof Error) {
      if (error.message === "EMAIL_YA_EXISTE") {
        return { error: "El email ya está registrado." };
      }

      if (error.message === "USERNAME_YA_EXISTE") {
        return { error: "El usuario ya existe." };
      }

      return { error: error.message };
    }

    return { error: "Error inesperado del servidor." };
  }
}

export async function actualizarUsuarioAction(formData: FormData) {
  try {
    const id_usuario = String(formData.get("id_usuario") ?? "");
    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const rol = String(formData.get("rol") ?? "");
    const estado = String(formData.get("estado") ?? "");

    // Mapear rol string → id_rol real
    let id_rol: string | null = null;

    if (rol === "Admin") {
      id_rol = "1A139223-1FCD-416C-B8FF-0F19BD52C986"; // tu UUID real de Admin
    }

    const activo = estado === "Activo";

    await usuarioService.actualizarUsuario({
      id_usuario,
      nombre,
      email,
      id_rol,
      activo,
    });

    revalidatePath("/usuarios");

    return { success: true };
  } catch (error: unknown) {
    console.error("ERROR UPDATE:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Error inesperado al actualizar" };
  }
}
