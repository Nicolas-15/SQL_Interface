import { Suspense } from "react";
import { getSessionUserAction } from "@/app/lib/action/auth/session.action";
import { redirect } from "next/navigation";
import { tieneAcceso } from "@/app/lib/utils/roles.config";
import GestionCasClient from "./GestionCasClient";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export default async function GestionCasPage() {
  const session = await getSessionUserAction();

  if (!session) {
    redirect("/auth/login");
  }

  if (!tieneAcceso(session.nombre_rol, "/consultas/gestion-cas")) {
    redirect("/consultas");
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Gestión de Usuarios CAS
          </h1>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="p-10 text-center text-gray-500">
            Cargando módulo...
          </div>
        }
      >
        <GestionCasClient />
      </Suspense>
    </div>
  );
}
