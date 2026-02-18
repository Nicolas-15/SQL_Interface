// app/home/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconUsers, IconNews, IconDatabase } from "@tabler/icons-react";
import { verificarJWT } from "@/app/lib/utils/jwt";
import { getCardsHome } from "@/app/lib/utils/roles.config";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userName = "";
  let nombreRol: string | null = null;
  try {
    const payload = verificarJWT(token) as {
      nombre?: string;
      nombre_rol?: string | null;
    };
    userName = payload.nombre || "";
    nombreRol = payload.nombre_rol || null;
  } catch {}

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
