"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TitularDB } from "@/app/repositories/titular.repository";
import {
  cambiarTitularAction,
  eliminarTitularAction,
} from "../../lib/action/titulares.action";

type Props = {
  titulares: TitularDB[];
};

// Diccionario de roles (UUID -> nombre legible)
const rolesMap: Record<string, string> = {
  "6F5E7B5A-689D-472E-92F4-34F729504107": "Administradora",
  "F93A2508-AAF6-4E77-A5B5-382FCB8416D9": "Alcalde",
  // agrega aquí los demás UUIDs si aparecen
};

export default function TitularesTable({ titulares }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<TitularDB | null>(null);
  const [formData, setFormData] = useState({ nombre: "", rut: "", id_rol: "" });

  const handleEdit = (t: TitularDB) => {
    setEditing(t);
    setFormData({ nombre: t.nombre, rut: t.rut, id_rol: t.id_rol });
  };

  const handleSave = async () => {
    if (!editing) return;
    // Se guarda nombre y rut, el rol se mantiene igual
    await cambiarTitularAction(formData.nombre, formData.rut, formData.id_rol);
    setEditing(null);
    router.refresh(); // 🔄 refresca la tabla
  };

  const handleDelete = async (id_rol: string) => {
    await eliminarTitularAction(id_rol);
    router.refresh(); // 🔄 refresca la tabla
  };

  return (
    <div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Nombre</th>
            <th className="border border-gray-300 p-2">RUT</th>
            <th className="border border-gray-300 p-2">Rol</th>
            <th className="border border-gray-300 p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {titulares.map((t) => (
            <tr key={t.id_titular} className="text-center">
              <td className="border border-gray-300 p-2">{t.nombre}</td>
              <td className="border border-gray-300 p-2">{t.rut}</td>
              <td className="border border-gray-300 p-2">
                {rolesMap[t.id_rol] || t.id_rol}
              </td>
              <td className="border border-gray-300 p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => handleEdit(t)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(t.id_rol)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0  flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-bold mb-4">Editar Titular</h2>
            <label className="block mb-2">
              Nombre:
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="border p-2 w-full"
              />
            </label>
            <label className="block mb-2">
              RUT:
              <input
                type="text"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
                className="border p-2 w-full"
              />
            </label>
            {/* El rol no se edita, solo se conserva */}
            <p className="mt-2 text-sm text-gray-600">
              Rol asignado: {rolesMap[formData.id_rol] || formData.id_rol}
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded mr-2"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
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
