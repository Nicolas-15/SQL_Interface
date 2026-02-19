"use server";

import { FirmanteRepository } from "../../../repositories/firmante.repository";

const repo = new FirmanteRepository();

/** Obtener titular actual */
export async function obtenerTitularActualAction() {
  try {
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
    await repo.intercambiarTitularidad(cargo);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo intercambiar la titularidad" };
  }
}
