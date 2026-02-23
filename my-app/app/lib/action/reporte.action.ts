"use server";

import { PermisoRepository } from "@/app/repositories/permiso.repository";
import { protectAction } from "@/app/lib/utils/auth-server";
import { AuditoriaRepository } from "@/app/repositories/auditoria.repository";
import { getSessionUserAction } from "./auth/session.action";

const auditoriaRepo = new AuditoriaRepository();

export async function obtenerReporteTransparenciaAction(
  fechaInicio: string,
  fechaFin: string,
) {
  try {
    const session = await protectAction("/consultas/reporte-transparencia");

    await auditoriaRepo.createAuditoria({
      id_usuario: session.id,
      modulo: "REPORTES",
      registro: "GENERAR_REPORTE",
      descripcion: `Generación de reporte de transparencia entre ${fechaInicio} y ${fechaFin}`,
    });

    const repo = new PermisoRepository();
    const reportes = await repo.obtenerReporteTransparencia(
      fechaInicio,
      fechaFin,
    );

    const serializedReportes = reportes.map((r) => ({
      ...r,
      Fecha_Pago: r.Fecha_Pago
        ? new Date(r.Fecha_Pago).toISOString().split("T")[0]
        : "",
      Fecha_Vencimiento: r.Fecha_Vencimiento
        ? new Date(r.Fecha_Vencimiento).toISOString().split("T")[0]
        : "",
    }));

    return { success: true, reportes: serializedReportes };
  } catch (error) {
    console.error("Error obteniendo reporte:", error);
    return { success: false, error: "Error al generar el reporte" };
  }
}

export async function testConnectionAction() {
  try {
    await protectAction("/consultas/reporte-transparencia");
    const repo = new PermisoRepository();
    const result = await repo.testConnection();
    return { success: true, message: "Conexión exitosa", data: result };
  } catch (error) {
    console.error("Error probando conexión:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function obtenerRangoFechasAction() {
  try {
    const repo = new PermisoRepository();
    const rango = await repo.obtenerRangoFechas();
    return {
      success: true,
      data: {
        MinFecha: rango.MinFecha
          ? new Date(rango.MinFecha).toISOString().split("T")[0]
          : null,
        MaxFecha: rango.MaxFecha
          ? new Date(rango.MaxFecha).toISOString().split("T")[0]
          : null,
      },
    };
  } catch (error) {
    console.error("Error obteniendo rango de fechas:", error);
    return { success: false, error: "Error al obtener rango de fechas" };
  }
}
