"use server";

import { UsuarioRepository } from "@/app/repositories/usuariocas.repository";
import { protectAction } from "@/app/lib/utils/auth-server";
import { getSessionUserAction } from "../auth/session.action";
import { revalidatePath } from "next/cache";

const repo = new UsuarioRepository();

/**
 * Obtener lista de usuarios de un sistema (por defecto 2 - Sistema)
 */
export async function getUsuariosDropdownAction(
  search: string = "",
  sistema: number | null = null,
) {
  try {
    await protectAction("/consultas/gestion-cas");
    const usuarios = await repo.findAllUsuarios(sistema, search);
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
    const session = await protectAction("/consultas/gestion-cas");

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
    const session = await protectAction("/consultas/gestion-cas");

    const base = formData.get("base") as string;
    const sistema = Number(formData.get("sistema") || 2);
    const usuariosJson = formData.get("usuarios") as string;

    if (!base || !usuariosJson) {
      return { error: "Faltan parámetros obligatorios." };
    }

    let usuariosPayload: { cuenta: string; nombre: string }[] = [];
    try {
      usuariosPayload = JSON.parse(usuariosJson);
    } catch (e) {
      return { error: "El formato de usuarios enviados es inválido." };
    }

    if (usuariosPayload.length === 0) {
      return { error: "Debe ingresar al menos un usuario para crear." };
    }

    // Validar existencia base
    const userBase = await repo.findUsuario(base, sistema);
    if (!userBase) return { error: `El usuario base ${base} no existe.` };

    let creados = 0;
    let creadosList: { cuenta: string; nombre: string }[] = [];
    let errores: string[] = [];

    // Iteración secuencial para proteger la BD
    for (const u of usuariosPayload) {
      const cuenta = u.cuenta.trim();
      const nombre = u.nombre.trim();

      if (!cuenta || !nombre) {
        errores.push(`Campos vacíos omitidos.`);
        continue;
      }

      if (cuenta.length > 6) {
        errores.push(`Usuario ${cuenta}: Excede límite de 6 caracteres.`);
        continue;
      }

      if (!/^[A-Z0-9]+$/.test(cuenta)) {
        errores.push(
          `Usuario ${cuenta}: Solo se permiten letras y números (sin espacios o especiales).`,
        );
        continue;
      }

      if (nombre.length > 60) {
        errores.push(
          `Usuario ${cuenta}: Nombre excede límite de 60 caracteres.`,
        );
        continue;
      }

      if (!/^[a-zA-Z0-9\s]+$/.test(nombre)) {
        errores.push(
          `Usuario ${cuenta}: El nombre solo permite letras, números y espacios.`,
        );
        continue;
      }

      // Validar que nuevo no exista
      const userNuevo = await repo.findUsuario(cuenta, sistema);
      if (userNuevo) {
        errores.push(`Usuario ${cuenta}: Ya existe.`);
        continue;
      }

      try {
        await repo.crearUsuario(
          { cuenta: cuenta, nombre: nombre, base },
          sistema,
          session.id,
        );
        creados++;
        creadosList.push({
          cuenta: cuenta,
          nombre: nombre,
        });
      } catch (e: any) {
        errores.push(`Usuario ${cuenta}: Error de BD (${e.message}).`);
      }
    }

    revalidatePath("/consultas/gestion-cas");

    if (errores.length > 0 && creados === 0) {
      return {
        error: `No se creó ningún usuario. Errores: ${errores.join(" | ")}`,
      };
    } else if (errores.length > 0 && creados > 0) {
      return {
        success: true,
        creadosList,
        message: `Se crearon ${creados} usuarios, pero hubo problemas con algunos: ${errores.join(" | ")}`,
      };
    }

    return {
      success: true,
      creadosList,
      message: `¡Éxito! ${creados} usuarios creados correctamente copiando el perfil de ${base}.`,
    };
  } catch (error: any) {
    console.error("Error crearUsuario:", error);
    return { error: error.message || "Error al crear usuario." };
  }
}

/**
 * Eliminar Usuario (Global o por Sistema)
 */
export async function eliminarUsuarioAction(formData: FormData) {
  try {
    const session = await protectAction("/consultas/gestion-cas");

    const cuenta = formData.get("cuenta") as string;
    const sistema = Number(formData.get("sistema") || 2);
    const modoGlobal = formData.get("modoGlobal") === "true"; // Determina el alcance

    if (!cuenta) {
      return { error: "Debe seleccionar un usuario para eliminar." };
    }

    if (modoGlobal) {
      await repo.eliminarUsuarioGlobal(cuenta, session.id);
      revalidatePath("/consultas/gestion-cas");
      return {
        success: true,
        message: `Usuario ${cuenta} eliminado exitosamente de TODOS los sistemas.`,
      };
    } else {
      await repo.eliminarUsuarioSistema(cuenta, sistema, session.id);
      revalidatePath("/consultas/gestion-cas");
      return {
        success: true,
        message: `Usuario ${cuenta} eliminado exitosamente del Sistema ${sistema}.`,
      };
    }
  } catch (error: any) {
    console.error("Error eliminarUsuario:", error);
    return { error: error.message || "Error al eliminar usuario." };
  }
}
