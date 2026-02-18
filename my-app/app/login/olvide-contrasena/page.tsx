"use client";

import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/app/lib/action/auth/forgot-password.action";
import Link from "next/link";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setMessage("");

    const email = formData.get("email") as string;
    if (!email || !email.includes("@")) {
      setError("Por favor ingrese un correo válido");
      return;
    }

    startTransition(async () => {
      const result = await forgotPasswordAction({}, formData);
      if (result.success) {
        setSuccess(true);
        setMessage(result.message || "");
      } else {
        setError(result.message || "Ocurrió un error");
      }
    });
  };

  return (
    <div className="py-20 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa tu correo electrónico y te enviaremos las instrucciones.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <h3 className="text-green-800 font-semibold mb-2">
              ¡Correo enviado!
            </h3>
            <p className="text-green-600 text-sm mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center text-green-700 font-medium hover:text-green-800 transition"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
                <IconMail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md"
            >
              {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}
