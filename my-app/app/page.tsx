import Link from "next/link";
import { IconUsers, IconNews, IconDatabase } from "@tabler/icons-react";
export default function Home() {
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
    <div className="hero min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="grid-separation mb-12">
        <h1 className=" text-center text-5xl font-bold text-black mb-4">
          Bienvenido a SQL Interface
        </h1>
        <p className="text-center text-xl text-gray-600 max-w-2xl mx-auto">
          Gestiona consultas, usuarios y contenido desde un solo lugar, de forma rápida y segura.
        </p>
      </section>

      {/* Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="block h-full">
            <div
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm
        hover:shadow-lg hover:-translate-y-1 transition-all
        cursor-pointer h-full"
            >
              <div className="mb-4">{card.icon}</div>

              <h2 className="text-2xl font-bold text-black mb-2">
                {card.title}
              </h2>

              <p className="text-gray-600">{card.description}</p>

              <div className="flex justify-end mt-4 font-semibold text-gray-700 hover:text-black">
                Acceder →
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
