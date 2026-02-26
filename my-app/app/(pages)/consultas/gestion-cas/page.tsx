import { Suspense } from "react";
import { protectPage } from "@/app/lib/utils/auth-server";
import GestionCasClient from "./GestionCasClient";

export default async function GestionCasPage() {
  await protectPage("/consultas/gestion-cas");

  return (
    <div className="py-6 md:py-10 space-y-8 mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Gestión de Usuarios CAS
          </h1>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="py-10 md:py-10 text-center text-gray-500">
            Cargando módulo...
          </div>
        }
      >
        <GestionCasClient />
      </Suspense>
    </div>
  );
}
