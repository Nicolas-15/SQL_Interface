/* Home.tsx Es nuestra pagina principal, contiene enlaces a las otras 3 secciones. Tiene una funcion que verifica si el usuario esta autenticado,
gracias a que guardamos un item "auth" en el localStorage al momento de hacer login. Si no esta autenticado, redirige a la pagina de login.
Contiene 3 cards que enlazan a las otras paginas: Consultas, Usuarios y Titulares. Ademas de sus botones y encabezado de recibimiento.
*/
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
      title: "Módulo de Gestión y Control Presupuestario",
      description: "Unidad central para la supervisión de flujos financieron municipales, cumplimiento de ley de transparencia y regularizacion de registros administrativos.", 
      href: "/consultas",
      icon: <IconDatabase className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Control de Usuarios",
      description: "Unidad centralizada para el control de identidades. Administre credenciales, asignar roles jerarquicos y supervise el estado de actividad de los funcionarios.",
      href: "/usuarios",
      icon: <IconUsers className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Gestión de Titulares Autorizados",
      description: "Unidad de gestión y modificación de titulares autorizados para la firma de Decretos de Pago Web y otros documentos oficiales.",
      href: "/titulares",
      icon: <IconNews className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <div className="min-h-screen py-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-black mb-2">
          Bienvenido a SQL Interface
        </h1>
        <p className="text-gray-600 text-lg">
          Plataforma centralizada para la gestión de información municipal, usuarios y titulares autorizados.
        </p>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="block h-full">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all h-full flex flex-col">
              <div className="mb-4">{card.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
              <p className="text-gray-600">{card.description}</p>
              <div className="flex justify-end mt-auto font-semibold text-blue-600">
                Acceder →
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
