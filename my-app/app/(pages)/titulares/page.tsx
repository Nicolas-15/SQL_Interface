"use client";

import { useState } from "react";
import { IconEdit, IconX } from "@tabler/icons-react";

type Titular = {
  id: number;
  cargo: string;
  nombre: string;
  email: string;
};

export default function Titulares() {
  const [titulares, setTitulares] = useState<Titular[]>([
    { id: 1, cargo: "Alcalde/sa", nombre: "Roberto Sánchez", email: "roberto.sanchez@municipio.cl" },
    { id: 2, cargo: "Administrador/a", nombre: "Patricia Contreras", email: "patricia.contreras@municipio.cl" },
  ]);

  const [titularActivo, setTitularActivo] = useState<Titular | null>(null);

  const handleGuardar = () => {
    if (!titularActivo) return;

    setTitulares((prev) =>
      prev.map((t) => (t.id === titularActivo.id ? titularActivo : t))
    );

    setTitularActivo(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-4xl font-bold mb-6 text-black">Titulares</h1>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full hidden md:table">
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
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{t.nombre}</td>
                <td className="px-6 py-3 text-gray-600">{t.cargo}</td>
                <td className="px-6 py-3 text-gray-600">{t.email}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => setTitularActivo(t)}
                    className="text-black hover:text-gray-600"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Versión mobile */}
        <div className="md:hidden divide-y">
          {titulares.map((t) => (
            <div key={t.id} className="p-4 flex flex-col gap-2">
              <span className="font-semibold">{t.cargo}</span>
              <span>{t.nombre}</span>
              <span className="text-sm text-gray-600">{t.email}</span>
              <button
                onClick={() => setTitularActivo(t)}
                className="flex items-center gap-2 text-sm text-black"
              >
                <IconEdit className="w-4 h-4" /> Editar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {titularActivo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Titular</h2>
              <button onClick={() => setTitularActivo(null)}>
                <IconX />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={titularActivo.nombre}
                onChange={(e) =>
                  setTitularActivo({ ...titularActivo, nombre: e.target.value })
                }
                className="border rounded px-3 py-2"
                placeholder="Nombre"
              />

              <input
                type="email"
                value={titularActivo.email}
                onChange={(e) =>
                  setTitularActivo({ ...titularActivo, email: e.target.value })
                }
                className="border rounded px-3 py-2"
                placeholder="Email"
              />

              <button
                onClick={handleGuardar}
                className="bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
