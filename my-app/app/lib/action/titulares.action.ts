"use server";

import { TitularRepository } from "../../repositories/titular.repository";

const repo = new TitularRepository();

export async function cambiarTitularAction(
  nombre: string,
  rut: string,
  id_rol: string,
) {
  try {
    const result = await repo.changeTitular({ nombre, rut, id_rol });
    return result;
  } catch (err) {
    console.error(err);
    return { error: "No se pudo cambiar el titular" };
  }
}

export async function eliminarTitularAction(id_rol: string) {
  try {
    await repo.deleteByRol(id_rol);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo eliminar el titular" };
  }
}
