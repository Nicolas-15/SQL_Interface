"use client";

import { FirmanteDB } from "@/app/repositories/firmante.repository";
import { intercambiarTitularesAction } from "@/app/lib/action/auth/titulares.action";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { IconSwitch } from "@tabler/icons-react";
import ConfirmationToast from "@/app/components/ConfirmationToast";

type Props = { titular: FirmanteDB | null };

export default function IntercambiarTitularPage({ titular }: Props) {
  const router = useRouter();

  const handleIntercambiar = async () => {
    toast(
      ({ closeToast }) => (
        <ConfirmationToast
          message="¿Desea intercambiar la titularidad?"
          onConfirm={async () => {
            const result = await intercambiarTitularesAction(
              titular?.Cargo ?? null,
            );
            if (result.success) {
              toast.success("Titularidad intercambiada correctamente");
              router.refresh();
            } else {
              toast.error(result.error || "Error al intercambiar titularidad");
            }
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
    <div className="min-h-[calc(80vh-80px)] w-full flex flex-col items-center justify-center">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <IconSwitch className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Titularidad DPW
          </h2>
          <p className="mt-2 text-md text-slate-600">
            Administra el titular actual habilitado para firmar documentos.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden text-center">
          <div className="px-6 py-8 sm:p-10">
            <h3 className="text-lg leading-6 font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Titular Actual
            </h3>

            {titular ? (
              <div className="space-y-6">
                <div>
                  <dt className="font-semibold text-slate-500 uppercase tracking-wider">
                    Cargo
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-slate-900">
                    {titular.Cargo}
                  </dd>
                </div>

                <div className="grid grid-cols-2 gap-4 text-md">
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wider">
                      RUT
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-200">
                      {titular.Rut_Firmante}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wider">
                      ID Interno
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-200">
                      {titular.Id_Firmante}
                    </dd>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de Datos
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      El titular actual no coincide con los registros
                      almacenados en la base de datos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 sm:px-10">
            <button
              onClick={handleIntercambiar}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-blue-500/30"
            >
              <IconSwitch className="w-5 h-5 transition-transform group-hover:rotate-180" />
              Intercambiar Titularidad
            </button>
            <p className="mt-4 text-center text-md text-slate-700 ">
              Esta acción registrará un cambio oficial en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
