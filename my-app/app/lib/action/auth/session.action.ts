"use server";

import { cookies } from "next/headers";
import { verificarJWT, generarJWT } from "@/app/lib/utils/jwt";
import { UsuarioRepository } from "@/app/repositories/user.repository";

export interface SessionUser {
  id: string;
  nombre: string;
  usuario: string;
  email: string;
  nombre_rol: string | null;
}

/**
 * Lee el JWT desde la cookie, busca el usuario fresco en la DB y retorna
 * los datos actualizados. Si los datos cambiaron, intenta regenerar el JWT.
 */
export async function getSessionUserAction(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const payload = verificarJWT(token) as {
      id_usuario?: string;
      nombre?: string;
      usuario?: string;
      email?: string;
      id_rol?: string | null;
      nombre_rol?: string | null;
    };
    if (!payload.id_usuario) return null;

    const repo = new UsuarioRepository();
    const usuario = await repo.findById(payload.id_usuario);
    if (!usuario || !usuario.activo) return null;

    // Si los datos cambiaron en la DB, regenerar el JWT
    const rolCambio =
      (usuario.nombre_rol ?? null) !== (payload.nombre_rol ?? null);
    const nombreCambio = usuario.nombre !== payload.nombre;
    const emailCambio = usuario.email !== payload.email;

    if (rolCambio || nombreCambio || emailCambio) {
      try {
        const nuevoToken = generarJWT({
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          usuario: usuario.usuario,
          email: usuario.email,
          id_rol: usuario.id_rol,
          nombre_rol: usuario.nombre_rol,
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
      } catch {
        // cookies().set() falla durante rendering de server components,
        // eso es normal — el JWT se regenerará en la próxima llamada
        // desde el cliente (UserContext.refreshUser)
      }
    }

    // Siempre retornar los datos frescos de la DB, incluso si no se
    // pudo actualizar el JWT (las páginas usan estos datos para la UI)
    return {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      email: usuario.email,
      nombre_rol: usuario.nombre_rol ?? null,
    };
  } catch {
    return null;
  }
}
