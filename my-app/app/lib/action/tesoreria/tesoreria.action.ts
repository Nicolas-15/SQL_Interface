"use server";

import { TesoreriaRepository } from "@/app/repositories/tesoreria.repository";
import { protectAction } from "@/app/lib/utils/auth-server";
import { revalidatePath } from "next/cache";

const repo = new TesoreriaRepository();

export async function previewPagoTesoreriaAction(formData: FormData) {
  try {
    await protectAction("/consultas/regularizacion");
    const caja = Number(formData.get("caja"));
    const folio = Number(formData.get("folio"));
    const rut = formData.get("rut") as string;
    const fechaStr = formData.get("fecha") as string; // YYYY-MM-DD

    if (!caja || !folio || !rut || !fechaStr) {
      return { error: "Todos los campos son obligatorios" };
    }

    const fecha = new Date(fechaStr + "T00:00:00");
    const pagos = await repo.findPago(caja, folio, rut, fecha);

    if (!pagos || pagos.length === 0) {
      return { error: "No se encontró el pago con los datos proporcionados." };
    }

    const plainPagos = JSON.parse(JSON.stringify(pagos));

    return { success: true, data: plainPagos };
  } catch (error: any) {
    console.error("Error in check:", error);
    return { error: "Error al buscar el pago: " + error.message };
  }
}

export async function reversarPagoTesoreriaAction(formData: FormData) {
  try {
    const session = await protectAction("/consultas/regularizacion");

    const caja = Number(formData.get("caja"));
    const folio = Number(formData.get("folio"));
    const rut = formData.get("rut") as string;
    const fechaStr = formData.get("fecha") as string;

    if (!caja || !folio || !rut || !fechaStr) {
      return { error: "Datos incompletos para reversar." };
    }

    const fecha = new Date(fechaStr + "T00:00:00");

    const itemsJson = formData.get("selectedItems") as string;
    let items: { orden: number; item: string }[] | undefined = undefined;

    if (itemsJson) {
      try {
        items = JSON.parse(itemsJson);
      } catch (e) {
        console.error("Error parsing selectedItems", e);
      }
    }

    await repo.reversarPago(caja, folio, rut, fecha, session.id, items);

    revalidatePath("/consultas/regularizacion");
    return { success: true, message: "Pago reversado exitosamente." };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al reversar el pago." };
  }
}

export async function deshacerUltimoReversoAction() {
  try {
    const session = await protectAction("/consultas/regularizacion");

    await repo.deshacerUltimoReverso(session.id);

    revalidatePath("/consultas/regularizacion");
    return { success: true, message: "Restauración de emergencia exitosa." };
  } catch (error: any) {
    console.error("Error al deshacer reverso:", error);
    return { error: error.message || "Error al deshacer el reverso." };
  }
}
