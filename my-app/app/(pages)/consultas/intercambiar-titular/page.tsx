"use client";

import { useState } from "react";
import { IconSwitch } from "@tabler/icons-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type UsuarioTitular = {
  id: number;
  nombre: string;
  email: string;
  esTitular: boolean;
};

type TitularesSistema = {
  ALCALDE: UsuarioTitular;
  ADMINISTRADOR: UsuarioTitular;
};

export default function IntercambiarTitularPage() {
  const [titulares, setTitulares] = useState<TitularesSistema>({
    ALCALDE: {
      id: 1,
      nombre: "José Jofré Bustos",
      email: "jose.jofre@municipio.cl",
      esTitular: true,
    },
    ADMINISTRADOR: {
      id: 2,
      nombre: "Patricia Contreras",
      email: "patricia.contreras@municipio.cl",
      esTitular: false,
    },
  });

  const confirmToast = (): Promise<boolean> => {
    return new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-800">
              ¿Estás seguro de que quieres intercambiar la titularidad?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  resolve(false);
                  closeToast();
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resolve(true);
                  closeToast();
                }}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        ),
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          className: "rounded-lg shadow-lg",
        },
      );
    });
  };

  const handleIntercambiarTitulares = async () => {
    const confirmar = await confirmToast();
    if (!confirmar) return;

    setTitulares((prev) => ({
      ALCALDE: { ...prev.ALCALDE, esTitular: !prev.ALCALDE.esTitular },
      ADMINISTRADOR: {
        ...prev.ADMINISTRADOR,
        esTitular: !prev.ADMINISTRADOR.esTitular,
      },
    }));

    toast.success("Titularidad intercambiada correctamente", {
      position: "bottom-right",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-black">
        Intercambiar Titular Decreto Pago Web
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Permite intercambiar la titularidad activa del sistema entre los roles
        disponibles.
      </p>

      {/* TABLA DE ROLES */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {/* Alcalde */}
            <tr className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 font-medium text-gray-900">
                Alcalde/sa
              </td>

              <td className="px-6 py-4 text-gray-600">
                {titulares.ALCALDE.nombre}
              </td>

              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    titulares.ALCALDE.esTitular
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {titulares.ALCALDE.esTitular
                    ? "Titular activo"
                    : "No titular"}
                </span>
              </td>
            </tr>

            {/* Administrador */}
            <tr className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 font-medium text-gray-900">
                Administrador/a
              </td>

              <td className="px-6 py-4 text-gray-600">
                {titulares.ADMINISTRADOR.nombre}
              </td>

              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    titulares.ADMINISTRADOR.esTitular
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {titulares.ADMINISTRADOR.esTitular
                    ? "Titular activo"
                    : "No titular"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* BOTÓN DE INTERCAMBIO */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleIntercambiarTitulares}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <IconSwitch className="w-5 h-5" />
          Intercambiar titularidad
        </button>
      </div>
    </div>
  );
}
