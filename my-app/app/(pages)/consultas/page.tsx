// Consultas.tsx
"use client";
import Link from "next/link";
import { IconSwitch, IconReport, IconFileSearch, IconArrowRight } from "@tabler/icons-react";

export default function Consultas() {
  const operaciones = [
    {
      id: 1,
      titulo: "Intercambiar Titular",
      descripcion: "Intercambiar entre dos personas titulares",
      icon: <IconSwitch className="w-6 h-6 text-blue-600" />,
      href: "/consultas/intercambiar-titular",
    },
    {
      id: 2,
      titulo: "Reporte Transparencia",
      descripcion: "Extraer información de transparencia por comuna y fechas",
      icon: <IconReport className="w-6 h-6 text-green-600" />,
      href: "/consultas/reporte-transparencia",
    },
    {
      id: 3,
      titulo: "Regularizar por Folio",
      descripcion: "Proceso de regularización en dos pasos independientes",
      icon: <IconFileSearch className="w-6 h-6 text-yellow-600" />,
      href: "/consultas/regularizar-folio",
    },
  ];

  return (
    <div className="p-6">
      {/* Título de sección */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-black mb-2">
          Seleccionar operación
        </h1>
        <p className="text-gray-600 text-lg">
          Elige una consulta predefinida para ejecutar
        </p>
      </div>

      {/* Cards de operaciones */}
      <div className="grid grid-cols-1 gap-6">
        {operaciones.map((op) => (
          <div
            key={op.id}
            className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              {op.icon}
              <div>
                <h2 className="text-xl font-semibold text-black">{op.titulo}</h2>
                <p className="text-gray-600 text-sm">{op.descripcion}</p>
              </div>
            </div>

            <Link
              href={op.href}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg border border-blue-600 hover:text-blue-600 transition-all"
            >
              Ejecutar
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
