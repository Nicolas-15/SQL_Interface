// app/home/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  IconUsers,
  IconNews,
  IconDatabase,
  IconShieldCheck,
} from "@tabler/icons-react";
import { getCardsHome } from "@/app/lib/utils/roles.config";
import { getSessionUserAction } from "@/app/lib/action/auth/session.action";
import { protectPage } from "@/app/lib/utils/auth-server";

export default async function HomePage() {
  const sessionUser = await protectPage("/");

  const userName = sessionUser.nombre;
  const nombreRol = sessionUser.nombre_rol;

  const now = new Date();
  const fecha = now.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fechaFormateada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  const iconMap: Record<string, React.ReactNode> = {
    "/consultas": <IconDatabase className="w-8 h-8 text-blue-500" />,
    "/usuarios": <IconUsers className="w-8 h-8 text-green-500" />,
    "/titulares": <IconNews className="w-8 h-8 text-yellow-500" />,
    "/auditoria": <IconShieldCheck className="w-8 h-8 text-gray-500" />,
  };

  const visibleCards = getCardsHome(nombreRol);

  return (
    <div className="min-h-screen py-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-black mb-2">
          Bienvenido{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-gray-500 text-sm mb-1">{fechaFormateada}</p>
        <p className="text-gray-600 text-lg">
          Plataforma centralizada para la gestión de información municipal,
          gestión de usuarios y titulares autorizados.
        </p>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleCards.map((card) => (
          <Link key={card.href} href={card.href} className="block h-full">
            <div
              className="
                group
                p-6
                bg-white
                border border-gray-200
                rounded-2xl
                shadow-sm
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-300
                h-full flex flex-col
              "
            >
              <div className="mb-4">{iconMap[card.href]}</div>

              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>

              <p className="text-gray-600">{card.description}</p>

              <div className="flex justify-end mt-auto font-semibold text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
                Acceder →
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
