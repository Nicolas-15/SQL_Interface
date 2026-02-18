"use client";

import { useActionState, Suspense } from "react";
import { resetPasswordAction } from "@/app/lib/action/auth/reset-password.action";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconLock, IconCheck, IconX } from "@tabler/icons-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, action, isPending] = useActionState(resetPasswordAction, {
    success: false,
    message: "",
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-4">
            <IconX className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Enlace inválido
          </h1>
          <p className="text-gray-500 mb-6">
            No se ha proporcionado un token válido para restablecer la
            contraseña.
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-4">
            <IconCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Contraseña Actualizada!
          </h3>
          <p className="text-gray-500 mb-6">
            Tu contraseña ha sido modificada exitosamente.
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="token" value={token} />

          {state.message && !state.success && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center">
              {state.message}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="******"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                minLength={6}
                required
              />
              <IconLock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="******"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                minLength={6}
                required
              />
              <IconLock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md"
          >
            {isPending ? "Guardando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
