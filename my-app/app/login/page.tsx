/* LoginPage.tsx Esta pagina contiene una funcion para verificar que el login del usuario sea correcto, nos da una validacion de que se debe
ingresar correo y contraseña, la validacion es basica y no se conecta a ningun backend.
Ademas contiene el diseño de la pagina de login con un fondo y un formulario centrado en la pantalla.
*/
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAt, IconKey } from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Debe ingresar correo y contraseña");
      return;
    }
    setError("");
    localStorage.setItem("auth", "true");
    router.push("/");
  };

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
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
              Bienvenido a SQL Interface
            </h1>

            <p className="text-sm text-gray-600 mb-6 text-center">
              Acceda con sus credenciales institucionales
            </p>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <IconAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Correo institucional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300
                   focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                   focus:outline-none transition"
                />
              </div>

              <div className="relative">
                <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300
                   focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                   focus:outline-none transition"
                />
              </div>
              {/* MENSAJE DE ERROR */}
              <div className="min-h-5">
                <p
                  className={`text-sm font-medium transition-opacity
      ${error ? "text-red-600 opacity-100" : "opacity-0"}`}
                >
                  {error || ""}
                </p>
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
