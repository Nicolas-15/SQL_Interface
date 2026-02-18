"use client";

import { IconLogout } from "@tabler/icons-react";
import { useState } from "react";
import { useUser } from "@/app/context/UserContext";

export default function LogoutButton() {
  const { logout } = useUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
      >
        <IconLogout className="w-4 h-4" />
        Cerrar sesión
      </button>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full mb-3">
                <IconLogout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                ¿Cerrar sesión?
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Tendrás que volver a iniciar sesión para acceder.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                {loading ? "Saliendo..." : "Sí, salir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
