"use client";

import { IconAlertTriangle } from "@tabler/icons-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full mb-4">
          <IconAlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
        <p className="text-gray-500 text-sm mb-6">
          {error.message || "Ocurrió un error inesperado al cargar la página."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
