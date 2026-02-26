"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TitularDB } from "@/app/repositories/titular.repository";
import { cambiarTitularAction } from "@/app/lib/action/auth/titulares.action";

import { toast } from "react-toastify";
import ConfirmationToast from "@/app/components/ConfirmationToast";
import { formatRut, validarRut } from "@/app/lib/utils/validations";

type Props = {
  titulares: TitularDB[];
};

// Diccionario de roles (UUID -> nombre legible)
const rolesMap: Record<string, string> = {
  "6F5E7B5A-689D-472E-92F4-34F729504107": "Administrador/a",
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
  const [rutError, setRutError] = useState("");

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

    toast(
      ({ closeToast }) => (
        <ConfirmationToast
          message="¿Guardar cambios del titular?"
          onConfirm={async () => {
            // Se guarda nombre y rut, el rol se mantiene igual
            await cambiarTitularAction(
              formData.nombre,
              formData.rut,
              formData.id_rol,
              formData.usuario,
              editing.esTitular,
            );
            setEditing(null);
            router.refresh();
            toast.success("Titular actualizado correctamente");
          }}
          closeToast={closeToast}
        />
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        className: "p-0 bg-transparent shadow-none",
      },
    );
  };

  return (
    <div className="mx-auto py-6 sm:py-8">
      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md py-2">
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
                    title={`Editar titular ${t.nombre}`}
                    aria-label={`Editar titular ${t.nombre}`}
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
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Editar Titular</h2>

            <label
              htmlFor="edit-nombre"
              className="block mb-3 text-sm font-medium"
            >
              Nombre
              <input
                id="edit-nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value.slice(0, 100),
                  })
                }
                maxLength={100}
                className="mt-1 border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label
              htmlFor="edit-rut"
              className="block mb-3 text-sm font-medium"
            >
              RUT
              <input
                id="edit-rut"
                type="text"
                value={formData.rut}
                onChange={(e) => {
                  const formatted = formatRut(e.target.value);
                  setFormData({ ...formData, rut: formatted });
                  if (formatted.length > 7) {
                    setRutError(validarRut(formatted) ? "" : "RUT inválido");
                  } else {
                    setRutError("");
                  }
                }}
                maxLength={12}
                className={`mt-1 border rounded-md p-2 w-full focus:outline-none focus:ring-2 transition-all ${
                  rutError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="12.345.678-9"
              />
              {rutError && (
                <p className="text-[10px] text-red-500 mt-0.5">{rutError}</p>
              )}
            </label>

            <label
              htmlFor="edit-usuario"
              className="block mb-3 text-sm font-medium"
            >
              Usuario
              <input
                id="edit-usuario"
                type="text"
                value={formData.usuario}
                onChange={(e) => {
                  const val = e.target.value
                    .slice(0, 8)
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");
                  setFormData({ ...formData, usuario: val });
                }}
                maxLength={8}
                className="mt-1 border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Máx. 8 carac."
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Límite: {formData.usuario.length}/8 caracteres
              </p>
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
