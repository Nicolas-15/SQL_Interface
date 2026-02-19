"use server";

import { TesoreriaRepository } from "@/app/repositories/tesoreria.repository";
import { getSessionUserAction } from "../auth/session.action";
import { revalidatePath } from "next/cache";

const repo = new TesoreriaRepository();

export async function previewPagoTesoreriaAction(formData: FormData) {
  try {
    const caja = Number(formData.get("caja"));
    const folio = Number(formData.get("folio"));
    const rut = formData.get("rut") as string;
    const fechaStr = formData.get("fecha") as string; // YYYY-MM-DD

    if (!caja || !folio || !rut || !fechaStr) {
      return { error: "Todos los campos son obligatorios" };
    }

    console.log("previewPagoTesoreriaAction inputs:", {
      caja,
      folio,
      rut,
      fechaStr,
    });

    const fecha = new Date(fechaStr + "T00:00:00");
    console.log("Date object:", fecha);

    const pagos = await repo.findPago(caja, folio, rut, fecha);
    console.log("Repo found:", pagos?.length);

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
    const session = await getSessionUserAction();
    if (!session) return { error: "No autorizado" };

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

    revalidatePath("/tesoreria/regularizacion");
    return { success: true, message: "Pago reversado exitosamente." };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al reversar el pago." };
  }
}
