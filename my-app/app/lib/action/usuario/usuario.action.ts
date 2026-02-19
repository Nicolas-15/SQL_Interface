"use server";

import { UsuarioRepository } from "@/app/repositories/usuariocas.repository";
import { getSessionUserAction } from "../auth/session.action";
import { revalidatePath } from "next/cache";

const repo = new UsuarioRepository();

/**
 * Obtener lista de usuarios de un sistema (por defecto 2 - Sistema)
 */
export async function getUsuariosDropdownAction(sistema: number = 2) {
  try {
    const usuarios = await repo.findAllUsuarios(sistema);
    const plainUsers = JSON.parse(JSON.stringify(usuarios));
    return { success: true, data: plainUsers };
  } catch (error: any) {
    console.error("Error fetching usuarios:", error);
    return { error: "Error al cargar usuarios." };
  }
}

/**
 * Replicar permisos
 */
export async function replicarPermisosAction(formData: FormData) {
  try {
    const session = await getSessionUserAction();
    if (!session) return { error: "No autorizado" };

    const origen = formData.get("origen") as string;
    const destino = formData.get("destino") as string;
    const sistema = Number(formData.get("sistema") || 2);

    if (!origen || !destino) {
      return {
        error: "Debe seleccionar un usuario de origen y uno de destino.",
      };
    }

    if (origen === destino) {
      return {
        error: "El usuario de origen y destino no pueden ser el mismo.",
      };
    }

    // Validar existencia (opcional, el repositorio fallará si es inválido, pero buena práctica)
    const userOrigen = await repo.findUsuario(origen, sistema);
    const userDestino = await repo.findUsuario(destino, sistema);

    if (!userOrigen) return { error: `El usuario origen ${origen} no existe.` };
    if (!userDestino)
      return { error: `El usuario destino ${destino} no existe.` };

    await repo.replicarPermisos(origen, destino, sistema, session.id);

    revalidatePath("/consultas/gestion-cas");
    return {
      success: true,
      message: `Permisos replicados correctamente de ${origen} a ${destino}.`,
    };
  } catch (error: any) {
    console.error("Error replicarPermisos:", error);
    return { error: error.message || "Error al replicar permisos." };
  }
}

/**
 * Crear Usuario
 */
export async function crearUsuarioAction(formData: FormData) {
  try {
    const session = await getSessionUserAction();
    if (!session) return { error: "No autorizado" };

    const base = formData.get("base") as string;
    const cuenta = formData.get("cuenta") as string;
    const nombre = formData.get("nombre") as string;
    const sistema = Number(formData.get("sistema") || 2);

    if (!base || !cuenta || !nombre) {
      return { error: "Todos los campos son obligatorios." };
    }

    if (cuenta.length > 10) {
      return { error: "La cuenta de usuario no puede exceder 10 caracteres." };
    }

    // Validar existencia base
    const userBase = await repo.findUsuario(base, sistema);
    if (!userBase) return { error: `El usuario base ${base} no existe.` };

    // Validar que nuevo no exista
    const userNuevo = await repo.findUsuario(cuenta, sistema);
    if (userNuevo) return { error: `El usuario ${cuenta} ya existe.` };

    await repo.crearUsuario(
      { cuenta: cuenta.toUpperCase(), nombre: nombre.toUpperCase(), base },
      sistema,
      session.id,
    );

    revalidatePath("/consultas/gestion-cas");
    return {
      success: true,
      message: `Usuario ${cuenta} creado correctamente copiando perfil de ${base}.`,
    };
  } catch (error: any) {
    console.error("Error crearUsuario:", error);
    return { error: error.message || "Error al crear usuario." };
  }
}
