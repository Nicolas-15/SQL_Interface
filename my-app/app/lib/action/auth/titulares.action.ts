"use server";

import { TitularRepository } from "../../../repositories/titular.repository";

const repo = new TitularRepository();

/** Cambiar titular por rol */
export async function cambiarTitularAction(
  nombre: string,
  rut: string,
  id_rol: string,
  usuario: string,
  esTitular: boolean = false, // por defecto inactivo
) {
  try {
    const result = await repo.changeTitular({
      nombre,
      rut,
      id_rol,
      usuario,
      esTitular,
    });
    return result;
  } catch (err) {
    console.error(err);
    return { error: "No se pudo cambiar el titular" };
  }
}

/** Eliminar titular por rol */
export async function eliminarTitularAction(id_rol: string) {
  try {
    await repo.deleteByRol(id_rol);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo eliminar el titular" };
  }
}

/** Intercambiar titularidad entre alcalde y administradora */
export async function intercambiarTitularesAction() {
  try {
    await repo.intercambiarTitulares();
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo intercambiar la titularidad" };
  }
}
