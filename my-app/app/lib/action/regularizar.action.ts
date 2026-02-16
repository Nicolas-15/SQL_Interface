"use server";

import { RegularizarService } from "../../services/regularizar.service";

const service = new RegularizarService();

export async function buscarDecretosAction(anio: number, numero: number) {
  try {
    const decretos = await service.buscarDecretos(anio, numero);
    console.log("Decretos encontrados:", decretos); // DEBUG
    return { success: true, decretos };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Error al buscar decretos" };
  }
}

export async function obtenerHistorialAction(anio: number, numero: number) {
  try {
    const historial = await service.buscarDecretoHistorico(anio, numero);
    return { success: true, historial };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Error al obtener historial" };
  }
}

export async function liberarDecretoAction(anio: number, numero: number) {
  try {
    const result = await service.liberarDecreto(anio, numero);
    if (!result) {
      return {
        success: false,
        error: "No se pudo liberar el decreto (o no se encontró)",
      };
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Error al liberar decreto" };
  }
}

export async function regularizarDecretoAction(anio: number, numero: number) {
  try {
    await service.regularizarDecreto(anio, numero);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Error al regularizar decreto" };
  }
}

export async function buscarDecretosLiberadosAction(
  anio: number,
  page: number = 1,
) {
  try {
    const { decretos, total } = await service.buscarDecretosLiberados(
      anio,
      page,
      10,
    );
    return { success: true, decretos, total };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Error al buscar decretos liberados." };
  }
}
