"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TitularDB } from "@/app/repositories/titular.repository";
import { cambiarTitularAction } from "@/app/lib/action/auth/titulares.action";

type Props = {
  titulares: TitularDB[];
};

// Diccionario de roles (UUID -> nombre legible)
const rolesMap: Record<string, string> = {
  "6F5E7B5A-689D-472E-92F4-34F729504107": "Administradora",
  "F93A2508-AAF6-4E77-A5B5-382FCB8416D9": "Alcalde",
};

export default function TitularesTable({ titulares }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<TitularDB | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    id_rol: "",
    usuario: "",
  });

  const handleEdit = (t: TitularDB) => {
    setEditing(t);
    setFormData({
      nombre: t.nombre,
      rut: t.rut,
      id_rol: t.id_rol,
      usuario: t.usuario,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    // Se guarda nombre y rut, el rol se mantiene igual
    await cambiarTitularAction(
      formData.nombre,
      formData.rut,
      formData.id_rol,
      formData.usuario,
    );
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">RUT</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {titulares.map((t) => (
              <tr
                key={t.id_titular}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {t.nombre}
                </td>

                <td className="px-6 py-4 text-gray-600">{t.rut}</td>

                <td className="px-6 py-4 text-gray-600">
                  {rolesMap[t.id_rol] || t.id_rol}
                </td>

                <td className="px-6 py-4 font-medium text-gray-600">
                  {t.usuario}
                </td>

                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs transition"
                    onClick={() => handleEdit(t)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Editar Titular</h2>

            <label className="block mb-3 text-sm font-medium">
              Nombre
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="mt-1 border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-3 text-sm font-medium">
              RUT
              <input
                type="text"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
                className="mt-1 border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-3 text-sm font-medium">
              Usuario
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) =>
                  setFormData({ ...formData, usuario: e.target.value })
                }
                className="mt-1 border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <p className="mt-2 text-sm text-gray-600">
              Rol asignado:{" "}
              <span className="font-medium">
                {rolesMap[formData.id_rol] || formData.id_rol}
              </span>
            </p>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md text-sm transition"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition"
                onClick={handleSave}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
