// RegularizacionFolioPage.tsx
"use client";
import { useState } from "react";

export default function RegularizacionFolioPage() {
  const [folio, setFolio] = useState("");
  const [estado, setEstado] = useState("");

  const regexFolio = /^FOL-\d{4}-\d{3}$/;

  const handlePaso = (numeroPaso: number) => {
    if (!folio) {
      alert("Debe ingresar un folio válido");
      return;
    }

    if (!regexFolio.test(folio)) {
      alert("El folio debe tener formato FOL-AAAA-###");
      return;
    }

    setEstado(`Paso ${numeroPaso} ejecutado para ${folio}`);
  };

  return (
    <div className="max-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Título */}
        <h1 className="text-4xl font-bold mb-2 text-center text-black">
          Regularizar por Folio
        </h1>
        <p className="text-gray-600 text-lg mb-8 text-center">
          Proceso de regularización en dos pasos independientes
        </p>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
          {/* Input de folio */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Folio (Ej: FOL-2025-001)
            </label>
            <input
              type="text"
              value={folio}
              onChange={(e) => setFolio(e.target.value.toUpperCase())}
              placeholder="FOL-2025-001"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones de pasos */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handlePaso(1)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Ejecutar Paso 1
            </button>
            <button
              onClick={() => handlePaso(2)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Ejecutar Paso 2
            </button>
          </div>

          {/* Estado */}
          {estado && (
            <p className="mt-6 text-center text-gray-700 font-medium">{estado}</p>
          )}
        </div>
      </div>
    </div>
  );
}
