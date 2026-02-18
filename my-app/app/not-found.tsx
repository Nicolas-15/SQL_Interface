import Link from "next/link";
import { IconHome, IconMoodSad } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex p-3 bg-gray-100 text-gray-400 rounded-full mb-4">
          <IconMoodSad className="w-10 h-10" />
        </div>
        <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <IconHome className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
