import { protectPage } from "@/app/lib/utils/auth-server";
import ReporteTransparenciaClient from "./ReporteTransparenciaClient";

export default async function ReporteTransparenciaPage() {
  await protectPage("/consultas/reporte-transparencia");
  return <ReporteTransparenciaClient />;
}
