"use client";

import { FirmanteDB } from "@/app/repositories/firmante.repository";
import { intercambiarTitularesAction } from "@/app/lib/action/auth/titulares.action";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { IconSwitch } from "@tabler/icons-react";

type Props = { titular: FirmanteDB | null };

export default function IntercambiarTitularPage({ titular }: Props) {
  const router = useRouter();

  const handleIntercambiar = async () => {
    const result = await intercambiarTitularesAction(titular?.Cargo ?? null);
    if (result.success) {
      toast.success("Titularidad intercambiada correctamente");
      router.refresh();
    } else {
      toast.error(result.error || "Error al intercambiar titularidad");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-4">Titular actual</h1>
      {titular ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-lg font-medium">{titular.Cargo}</p>
          <p className="text-gray-600">{titular.Rut_Firmante}</p>
          <p className="text-gray-600">{titular.Id_Firmante}</p>
        </div>
      ) : (
        <p className="text-center font-bold text-red-500 text-lg">
          Titular Actual no coincide con el usuario almacenado en la base de
          datos
        </p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleIntercambiar}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <IconSwitch className="w-5 h-5" />
          Intercambiar titularidad
        </button>
      </div>
    </div>
  );
}
