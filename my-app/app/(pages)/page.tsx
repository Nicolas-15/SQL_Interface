// Home.tsx
"use client";
import Link from "next/link";
import { IconUsers, IconNews, IconDatabase } from "@tabler/icons-react";
import { redirect } from "next/navigation";

export default function Home() {
  // Verificar autenticación
  const isAuth = typeof window !== "undefined" && localStorage.getItem("auth") === "true";
  if (!isAuth) redirect("/login");

  const cards = [
    {
      title: "Consultas",
      description: "Realiza consultas a la base de datos",
      href: "/consultas",
      icon: <IconDatabase className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Usuarios",
      description: "Administra usuarios del sistema",
      href: "/usuarios",
      icon: <IconUsers className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Titulares",
      description: "Gestiona titulares y noticias",
      href: "/titulares",
      icon: <IconNews className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Encabezado */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-black mb-2">
          Bienvenido a SQL Interface
        </h1>
        <p className="text-gray-600 text-lg">
          Gestiona consultas, usuarios y contenido desde un solo lugar.
        </p>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="block">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="mb-4">{card.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
              <p className="text-gray-600">{card.description}</p>
              <div className="flex justify-end mt-4 font-semibold text-blue-600">
                Acceder →
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
