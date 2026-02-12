"use client";

import Link from "next/link";
import {
  IconSwitch,
  IconReport,
  IconFileSearch,
  IconArrowRight,
} from "@tabler/icons-react";

export default function Consultas() {
  const operaciones = [
    {
      id: 1,
      titulo: "Modificación de Titularidad Pagos Web",
      descripcion:
        "Permite el cambio legal del beneficiario en decretos de pago ya generados, asegurando una correcta asignación de fondos.",
      icon: (
        <div className="p-3 rounded-xl bg-blue-50">
          <IconSwitch className="w-6 h-6 text-blue-600" />
        </div>
      ),
      href: "/consultas/intercambiar-titular",
    },
    {
      id: 2,
      titulo: "Extracción de Reporte de Transparencia",
      descripcion:
        "Genera reportes detallados de decretos de pago por rango de fecha, monto o beneficiario.",
      icon: (
        <div className="p-3 rounded-xl bg-green-50">
          <IconReport className="w-6 h-6 text-green-600" />
        </div>
      ),
      href: "/consultas/reporte-transparencia",
    },
    {
      id: 3,
      titulo: "Regularizar por Folio",
      descripcion:
        "Ejecuta un proceso de normalización para decretos inconsistentes, permitiendo validar folios en el sistema y corregir errores.",
      icon: (
        <div className="p-3 rounded-xl bg-yellow-50">
          <IconFileSearch className="w-6 h-6 text-yellow-600" />
        </div>
      ),
      href: "/consultas/regularizar-folio",
    },
  ];

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      {/* Título */}
      <div className="max-w-6xl mx-auto px-6 text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Consultas Predefinidas
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Selecciona una consulta disponible para continuar
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 px-4 sm:px-6">
        {operaciones.map((op) => (
          <div
            key={op.id}
            className="
              flex flex-col gap-6
              md:flex-row md:items-center md:justify-between
              p-6
              bg-white
              rounded-2xl
              shadow-sm
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-300
            "
          >
            {/* Icono + texto */}
            <div className="flex items-start gap-4">
              {op.icon}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {op.titulo}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{op.descripcion}</p>
              </div>
            </div>

            {/* Botón mejorado */}
            <Link
              href={op.href}
              className="
                inline-flex items-center justify-center gap-2
                w-full md:w-auto
                px-6 py-3
                rounded-xl
                bg-blue-600 text-white
                text-sm font-medium
                hover:bg-blue-700
                transition
              "
            >
              Ejecutar consulta
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
