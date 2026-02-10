"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconAt, IconKey } from "@tabler/icons-react";
import { loginAction } from "../lib/action/auth/login.action";

interface LoginState {
  success: boolean;
  message?: string;
}

const initialState: LoginState = {
  success: false,
};

export default function LoginPage() {
  const router = useRouter();

  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [state.success, router]);

  return (
    <section className="w-full max-w-lg py-10 md:py-15 lg:py-20 mx-auto">
      {/* Card */}
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Imagen superior */}
          <div
            className="h-44 bg-cover bg-center"
            style={{ backgroundImage: "url('/login.webp')" }}
          />

          {/* Formulario */}
          <form action={formAction} className="p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
              Bienvenido a SQL Interface
            </h1>

            <p className="text-sm text-gray-600 mb-6 text-center">
              Acceda con sus credenciales institucionales
            </p>

            <div className="flex flex-col gap-4">
              {/* Identificador */}
              <div className="relative">
                <IconAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="identificador"
                  placeholder="Correo o usuario"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300
                  focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                  focus:outline-none transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300
                  focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                  focus:outline-none transition"
                />
              </div>

              {/* Error backend */}
              <div className="min-h-5">
                {state.message && (
                  <p className="text-sm font-medium text-red-600">
                    {state.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e504f] hover:bg-[#1e504f]/90
                text-white py-3 rounded-lg font-semibold transition"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
