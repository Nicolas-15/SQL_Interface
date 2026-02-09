/* Consultas.tsx
   Contiene las consultas predefinidas con sus respectivas rutas y descripciones.
   Cada consulta se muestra como una tarjeta con un ícono, título, descripción
   y un botón para ejecutar la consulta.
*/

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
      icon: <IconSwitch className="w-6 h-6 text-blue-600 shrink-0" />,
      href: "/consultas/intercambiar-titular",
    },
    {
      id: 2,
      titulo: "Extracción de Reporte de Transparencia",
      descripcion:
        "Genera reportes detallados de decretos de pago por rango de fechas, mostrando información clave como el monto total pagado y su beneficiario.",
      icon: <IconReport className="w-6 h-6 text-green-600 shrink-0" />,
      href: "/consultas/reporte-transparencia",
    },
    {
      id: 3,
      titulo: "Regularizar por Folio",
      descripcion:
        "Ejecuta un proceso de normalización para decretos inconsistentes, permitiendo validar folios en el sistema y corregir errores.",
      icon: <IconFileSearch className="w-6 h-6 text-yellow-600 shrink-0" />,
      href: "/consultas/regularizar-folio",
    },
  ];

  return (
    <div className="py-6">
      {/* Título de sección */}
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
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
              flex flex-col gap-4
              md:flex-row md:items-center md:justify-between
              p-4 sm:p-6
              bg-white border border-gray-200
              rounded-lg shadow-sm
              hover:shadow-md transition-all
            "
          >
            {/* Ícono + texto */}
            <div className="flex items-start gap-4">
              {op.icon}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-black">
                  {op.titulo}
                </h2>
                <p className="text-gray-600 text-sm">
                  {op.descripcion}
                </p>
              </div>
            </div>

            {/* Botón */}
            <Link
              href={op.href}
              className="
                flex items-center justify-center gap-2
                w-full md:w-auto
                px-4 py-2
                bg-white text-black
                rounded-lg border border-blue-600
                hover:text-blue-600
                transition-all
              "
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
