"use server";

import { FirmanteRepository } from "@/app/repositories/firmante.repository";
import { protectAction } from "@/app/lib/utils/auth-server";
import { revalidatePath } from "next/cache";
import { TitularRepository } from "@/app/repositories/titular.repository";
import { AuditoriaRepository } from "@/app/repositories/auditoria.repository";
import { getSessionUserAction } from "@/app/lib/action/auth/session.action";

const repo = new FirmanteRepository();
const auditoriaRepo = new AuditoriaRepository();

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

    const session = await getSessionUserAction();
    await auditoriaRepo.createAuditoria({
      id_usuario: session?.id || "",
      modulo: "TITULARES",
      registro: "INTERCAMBIO_TITULARIDAD",
      descripcion: `Intercambio de firmas/titularidad completado para cargo: ${cargo}`,
    });

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
  const { validarRut } = require("@/app/lib/utils/validations");

  if (!validarRut(rut)) {
    return { error: "El RUT ingresado no es válido." };
  }

  try {
    await protectAction("/consultas/intercambiar-titular");
    await repo.changeTitular({
      nombre,
      rut,
      id_rol,
      usuario,
      esTitular,
    });

    const session = await getSessionUserAction();
    await auditoriaRepo.createAuditoria({
      id_usuario: session?.id || "",
      modulo: "TITULARES",
      registro: "CAMBIO_TITULAR",
      descripcion: `Cambio de datos del titular: ${nombre} (${usuario})`,
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo actualizar el titular" };
  }
}
