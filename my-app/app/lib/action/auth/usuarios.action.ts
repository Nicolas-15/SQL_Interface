"use server";

import { UsuarioService } from "@/app/services/usuario.service";
import { UsuarioRepository } from "@/app/repositories/user.repository";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/app/lib/utils/hash";
import { connectToDB } from "@/app/lib/utils/db-connection";
import sql from "mssql";

const usuarioService = new UsuarioService();

export async function eliminarUsuarioAction(id: string) {
  try {
    await usuarioService.eliminarUsuario(id);
    revalidatePath("/usuarios");
    return { success: true, message: "Usuario eliminado de la base de datos" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "USUARIO_DESACTIVADO") {
        revalidatePath("/usuarios");
        return {
          success: true,
          message:
            "El usuario tiene registros de auditoría y no se puede eliminar. Fue desactivado.",
        };
      }
      return { error: error.message };
    }
    return { error: "Error inesperado al eliminar" };
  }
}

export async function crearUsuarioAction(formData: FormData) {
  try {
    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const rol = String(formData.get("rol") ?? "").trim();

    // Generar contraseña aleatoria segura (8 caracteres)
    const password = Math.random().toString(36).slice(-8);

    const usuario = email;

    // Buscar id_rol a partir del nombre_rol
    let id_rol: string | null = null;
    if (rol) {
      const repo = new UsuarioRepository();
      id_rol = await repo.findRolByName(rol);
    }

    await usuarioService.crearUsuario({
      nombre,
      usuario,
      email,
      password,
      id_rol,
    });

    // Enviar correo de bienvenida con credenciales
    try {
      const { sendWelcomeEmail } = await import("@/app/lib/utils/email");
      await sendWelcomeEmail(email, nombre, usuario, password);
    } catch (emailError) {
      console.error("Error enviando email de bienvenida:", emailError);
      // No bloqueamos el flujo si falla el email, pero logueamos el error
    }

    revalidatePath("/usuarios");

    return {
      success: true,
      message: "Usuario creado y credenciales enviadas por correo",
    };
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
            "SELECT id_rol FROM [app_Interface].[dbo].[rol] WHERE nombre_rol = @nombre_rol",
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

    // Si el usuario editado es el usuario logueado, regenerar el JWT
    const { cookies } = await import("next/headers");
    const { verificarJWT, generarJWT } = await import("@/app/lib/utils/jwt");
    const { UsuarioRepository } =
      await import("@/app/repositories/user.repository");

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      try {
        const payload = verificarJWT(token) as { id_usuario?: string };
        if (payload.id_usuario === id_usuario) {
          // Es el mismo usuario logueado — regenerar JWT con datos frescos
          const repo = new UsuarioRepository();
          const usuarioFresco = await repo.findById(id_usuario);
          if (usuarioFresco) {
            const nuevoToken = generarJWT({
              id_usuario: usuarioFresco.id_usuario,
              nombre: usuarioFresco.nombre,
              usuario: usuarioFresco.usuario,
              email: usuarioFresco.email,
              id_rol: usuarioFresco.id_rol,
              nombre_rol: usuarioFresco.nombre_rol,
            });

            cookieStore.set({
              name: "auth_token",
              value: nuevoToken,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 60 * 60,
            });
          }
        }
      } catch {}
    }

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
// Enviar correo con nueva contraseña aleatoria (Admin Reset)
export async function enviarRecuperacionAction(email: string) {
  try {
    const { connectToDB } = await import("@/app/lib/utils/db-connection");
    const sql = (await import("mssql")).default;
    const { sendNewPasswordEmail } = await import("@/app/lib/utils/email");
    const db = await connectToDB("");

    if (!db) throw new Error("No se pudo conectar a la BD");

    // 1. Buscar usuario para obtener ID y Nombre
    const userResult = await db
      .request()
      .input("email", sql.VarChar(100), email)
      .query("SELECT id_usuario, nombre FROM USUARIO WHERE email = @email");

    const user = userResult.recordset[0];
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Generar contraseña aleatoria (8 caracteres)
    const newPassword = Math.random().toString(36).slice(-8);
    const hash = hashPassword(newPassword);

    // 3. Actualizar contraseña en BD
    await db
      .request()
      .input("id", sql.UniqueIdentifier, user.id_usuario)
      .input("pass", sql.VarChar(256), hash)
      .query(
        "UPDATE USUARIO SET contraseña = @pass, codigo = NULL, fecha_expiracion = NULL WHERE id_usuario = @id",
      );

    // 4. Enviar correo
    await sendNewPasswordEmail(email, user.nombre, newPassword);

    return {
      success: true,
      message: `Nueva contraseña enviada a ${email}`,
    };
  } catch (error: unknown) {
    console.error("ERROR ENVIAR RECUPERACION:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error inesperado al enviar correo de recuperación" };
  }
}
