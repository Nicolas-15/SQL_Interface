"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/lib/action/auth/login.action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconAt, IconKey } from "@tabler/icons-react";

interface LoginState {
  success: boolean;
  message?: string;
}

const initialState: LoginState = { success: false };

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialState);

  // Cuando loginAction devuelve success:true, redirige al dashboard
  if (state.success) {
    router.replace("/home");
  }

  return (
    <section className="w-full max-w-lg py-10 mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div
          className="h-44 bg-cover bg-center"
          style={{ backgroundImage: "url('/login.webp')" }}
        />
        <form action={formAction} className="p-6">
          <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-blue-900 tracking-tight drop-shadow-sm">
            Bienvenido a ApliCAS
          </h1>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <IconAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="identificador"
                placeholder="Correo o usuario"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300
                  focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="relative">
              <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type="password"
                placeholder="Contraseña"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300
                  focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Mensaje de error */}
            <div className="min-h-5">
              {state.message && (
                <p className="text-sm font-medium text-red-600">
                  {state.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700
                text-white py-3 rounded-lg font-semibold transition"
            >
              Ingresar
            </button>
          </div>
        </form>

        <div className="text-center pb-4">
          <Link
            href="/login/olvide-contrasena"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </section>
  );
}
