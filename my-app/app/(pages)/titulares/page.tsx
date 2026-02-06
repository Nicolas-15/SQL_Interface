/* Titulares.tsx Esta pagina contiene una tabla con los titulares del sistema, mostrando su cargo, nombre y email. Ademas de un boton para editar cada titular, aun sin funcionalidad.
Debemos hacer que esta tabla sea responsive, Los titulares van a salir de la base de datos, pero siempre seran 2 los mismos titulares durante el mandato.
*/
"use client";
import { IconEdit } from "@tabler/icons-react";

export default function Titulares() {
  const titulares = [
    { id: 1, cargo: "Alcalde/sa", nombre: "Roberto Sánchez", email: "roberto.sanchez@municipio.cl" },
    { id: 2, cargo: "Administrador/a", nombre: "Patricia Contreras", email: "patricia.contreras@municipio.cl" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Título */}
      <h1 className="text-4xl font-bold mb-6 text-black">Titulares</h1>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Titular</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Cargo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {titulares.map((t) => (
              <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 text-black font-medium">{t.nombre}</td>
                <td className="px-6 py-3 text-gray-600">{t.cargo}</td>
                <td className="px-6 py-3 text-gray-600">{t.email}</td>
                <td className="px-6 py-3 flex gap-4">
                  <button className="text-black hover:text-gray-600">
                    <IconEdit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
