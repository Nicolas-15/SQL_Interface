// app/home/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconUsers, IconNews, IconDatabase } from "@tabler/icons-react";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Si no hay token → redirigir al login
  if (!token) {
    redirect("/login");
  }

  const cards = [
    {
      title: "Módulo de Gestión y Control Presupuestario",
      description:
        "Unidad central para la supervisión de flujos financieros municipales, cumplimiento de la Ley de Transparencia y regularización de registros administrativos.",
      href: "/consultas",
      icon: <IconDatabase className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Control de Usuarios",
      description:
        "Unidad centralizada para el control de identidades. Permite administrar credenciales, asignar roles jerárquicos y supervisar el estado de actividad de los funcionarios.",
      href: "/usuarios",
      icon: <IconUsers className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Gestión de Titulares Autorizados",
      description:
        "Unidad de gestión y modificación de titulares autorizados para la firma de Decretos de Pago Web y otros documentos oficiales.",
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
          Plataforma centralizada para la gestión de información municipal,
          gestión de usuarios y titulares autorizados.
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
