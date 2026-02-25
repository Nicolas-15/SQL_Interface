import { protectPage } from "@/app/lib/utils/auth-server";
import RegularizacionClient from "./RegularizacionClient";

export default async function RegularizacionPage() {
  await protectPage("/consultas/regularizacion");
  return (
    <div className="mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Regularización de Pagos
        </h1>
        <p className="text-gray-600 text-lg">
          Módulo de Tesorería para la reversa y corrección de pagos duplicados o
          inconclusos.
        </p>
      </div>
      <div className="border-t border-gray-200 pt-6">
        <RegularizacionClient />
      </div>
    </div>
  );
}
