"use server";

import { FirmanteRepository } from "@/app/repositories/firmante.repository";
import { protectAction } from "@/app/lib/utils/auth-server";
import { revalidatePath } from "next/cache";
import { TitularRepository } from "@/app/repositories/titular.repository";

const repo = new FirmanteRepository();

/** Obtener titular actual */
export async function obtenerTitularActualAction() {
  try {
    await protectAction("/consultas/intercambiar-titular");
    const titular = await repo.findTitularActual();
    return { success: true, titular };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo obtener el titular actual" };
  }
}

/** Intercambiar titularidad */
export async function intercambiarTitularesAction(cargo: string | null) {
  try {
    await protectAction("/consultas/intercambiar-titular");
    if (!cargo) throw new Error("Parámetro cargo es requerido");
    await repo.intercambiarTitularidad(cargo);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo intercambiar la titularidad" };
  }
}

/** Cambiar datos del titular (nombre, rut, usuario, etc.) */
export async function cambiarTitularAction(
  nombre: string,
  rut: string,
  id_rol: string,
  usuario: string,
  esTitular: boolean,
) {
  const repo = new TitularRepository();
  try {
    await protectAction("/consultas/intercambiar-titular");
    await repo.changeTitular({
      nombre,
      rut,
      id_rol,
      usuario,
      esTitular,
    });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo actualizar el titular" };
  }
}
