import { protectPage } from "@/app/lib/utils/auth-server";
import { AuditoriaRepository } from "@/app/repositories/auditoria.repository";
import AuditoriaClient from "@/app/(pages)/auditoria/AuditoriaClient";

export const metadata = {
  title: "Auditoría | ApliCAS",
  description: "Visor de registros de auditoría y bitácora del sistema.",
};

export default async function AuditoriaPage() {
  // Solo administradores y soporte pueden ver la auditoría
  await protectPage("/auditoria");

  const repo = new AuditoriaRepository();
  const audits = await repo.findAll({ limit: 200 });

  // Serializar datos para el cliente
  const plainAudits = JSON.parse(JSON.stringify(audits));

  return <AuditoriaClient initialAudits={plainAudits} />;
}
