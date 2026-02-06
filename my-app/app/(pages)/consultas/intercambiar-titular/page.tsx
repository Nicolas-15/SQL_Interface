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
      email: "José.jofré@municipio.cl",
      esTitular: true,
    },
    ADMINISTRADOR: {
      id: 2,
      nombre: "Patricia Contreras",
      email: "patricia.contreras@municipio.cl",
      esTitular: false,
    },
  });

  // 🔔 Toast de confirmación (Tailwind)
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
                className="px-4 py-2 rounded-md border border-gray-300
                           text-gray-700 hover:bg-gray-100 transition text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  resolve(true);
                  closeToast();
                }}
                className="px-4 py-2 rounded-md bg-blue-600 text-white
                           hover:bg-blue-700 transition text-sm"
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
        }
      );
    });
  };

  const HandleIntercambiarTitulares = async () => {
    const confirmar = await confirmToast();

    if (!confirmar) return;

    setTitulares((prev) => ({
      ALCALDE: { ...prev.ALCALDE, esTitular: !prev.ALCALDE.esTitular },
      ADMINISTRADOR: {
        ...prev.ADMINISTRADOR,
        esTitular: !prev.ADMINISTRADOR.esTitular,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-black">
        Intercambiar Titular Decreto Pago Web
      </h1>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Alcalde/sa</p>
          <p className="text-lg font-semibold">
            {titulares.ALCALDE.nombre}
          </p>
          <span
            className={`text-sm font-medium ${
              titulares.ALCALDE.esTitular
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {titulares.ALCALDE.esTitular
              ? "Titular activo"
              : "No titular"}
          </span>
        </div>

        <div>
          <p className="text-sm text-gray-500">Administrador/a</p>
          <p className="text-lg font-semibold">
            {titulares.ADMINISTRADOR.nombre}
          </p>
          <span
            className={`text-sm font-medium ${
              titulares.ADMINISTRADOR.esTitular
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {titulares.ADMINISTRADOR.esTitular
              ? "Titular activo"
              : "No titular"}
          </span>
        </div>

        <button
          onClick={HandleIntercambiarTitulares}
          className="flex items-center gap-2 bg-blue-600 text-white
                     px-5 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <IconSwitch className="w-5 h-5" />
          Intercambiar titularidad
        </button>
      </div>
    </div>
  );
}
