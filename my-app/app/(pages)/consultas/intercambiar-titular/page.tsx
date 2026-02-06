/* IntercambiarTitularPage.tsx nos permite intercambiar entre dos titulares (Tenemos 2 constantes "Alcalde" y "Administradora").
al hacer click en el boton se actualiza el estado mostrando al otro titular. 
*/
"use client";
import { useState } from "react";
import { IconSwitch } from "@tabler/icons-react";

export default function IntercambiarTitularPage() {
  const [titularActual, setTitularActual] = useState("Alcalde");
  const titulares = ["Alcalde", "Administradora"];
  const otroTitular = titulares.find((t) => t !== titularActual)!;

  const handleSwap = () => {
    setTitularActual(otroTitular);
  };

  return (
    <div className="max-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        
        {/* Título */}
        <h1 className="text-4xl font-bold mb-2 text-center text-black">
          Intercambiar Titular
        </h1>
        <p className="text-gray-600 text-lg mb-8 text-center">
          Haz clic en el botón para cambiar al otro titular
        </p>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
          {/* Titular actual */}
          <div className="mb-6 border border-gray-200 px-4 py-2 rounded-lg">
            <label className="block text-gray-700 font-medium mb-1">
              Titular actual
            </label>
            <div className="bg-gray-100 text-gray-900 text-lg rounded-lg font-medium px-4 py-2">
              {titularActual}
            </div>
          </div>

          {/* Botón para intercambiar */}
          <button
            onClick={handleSwap}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            <IconSwitch className="w-5 h-5" />
            Intercambiar por {otroTitular}
          </button>
        </div>
      </div>
    </div>
  );
}
