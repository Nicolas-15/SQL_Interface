"use server";

import { UsuarioService } from "@/app/services/usuario.service";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/app/lib/utils/hash";
import { connectToDB } from "@/app/lib/utils/db-connection";
import sql from "mssql";

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

    // Buscar id_rol por nombre_rol en la BD
    let id_rol: string | null = null;
    if (rol) {
      const { connectToDB } = await import("@/app/lib/utils/db-connection");
      const sql = (await import("mssql")).default;
      const db = await connectToDB("");
      if (db) {
        const result = await db
          .request()
          .input("nombre_rol", sql.VarChar(100), rol)
          .query(
            "SELECT id_rol FROM [SQL_Interface].[dbo].[rol] WHERE nombre_rol = @nombre_rol",
          );
        id_rol = result.recordset[0]?.id_rol || null;
      }
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
//Forzar reseteo de contraseña
export async function resetPasswordAction(id_usuario: string) {
  try {
    const nuevaPassword = "123456";
    const hash = hashPassword(nuevaPassword);

    const db = await connectToDB("");
    if (!db) throw new Error("No se pudo conectar a la BD");

    await db
      .request()
      .input("id", sql.UniqueIdentifier, id_usuario)
      .input("pass", sql.VarChar(256), hash)
      .query("UPDATE USUARIO SET contraseña = @pass WHERE id_usuario = @id");

    return { success: true, password: nuevaPassword };
  } catch (error: unknown) {
    console.error("ERROR RESET PASSWORD:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error inesperado al resetear contraseña" };
  }
}
