import { cookies } from "next/headers";
import Link from "next/link";
import {
  IconSwitch,
  IconReport,
  IconFileSearch,
  IconArrowRight,
  IconUsers,
  IconReceiptDollar,
  IconLock,
} from "@tabler/icons-react";
import { verificarJWT } from "@/app/lib/utils/jwt";
import { getModulosConsultas } from "@/app/lib/utils/roles.config";

const iconMap: Record<string, React.ReactNode> = {
  blue: (
    <div className="p-3 rounded-xl bg-blue-50">
      <IconSwitch className="w-6 h-6 text-blue-600" />
    </div>
  ),
  rose: (
    <div className="p-3 rounded-xl bg-rose-50">
      <IconReport className="w-6 h-6 text-rose-800" />
    </div>
  ),
  yellow: (
    <div className="p-3 rounded-xl bg-yellow-50">
      <IconFileSearch className="w-6 h-6 text-yellow-600" />
    </div>
  ),
  green: (
    <div className="p-3 rounded-xl bg-green-50">
      <IconReceiptDollar className="w-6 h-6 text-green-600" />
    </div>
  ),
  purple: (
    <div className="p-3 rounded-xl bg-purple-50">
      <IconUsers className="w-6 h-6 text-purple-700" />
    </div>
  ),
};

export default async function Consultas() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let nombreRol: string | null = null;
  if (token) {
    try {
      const payload = verificarJWT(token) as { nombre_rol?: string | null };
      nombreRol = payload.nombre_rol || null;
    } catch {}
  }

  const modulos = getModulosConsultas(nombreRol);

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      {/* Título */}
      <div className="mx-auto text-center mb-10 ">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Consultas Predefinidas
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Selecciona una consulta disponible para continuar
        </p>
      </div>

      {/* Cards */}
      <div className=" mx-auto grid grid-cols-1 gap-6">
        {modulos.map((op) => (
          <div
            key={op.id}
            className={`
              flex flex-col gap-6
              md:flex-row md:items-center md:justify-between
              p-6
              bg-white
              rounded-2xl
              shadow-sm
              transition-all duration-300
              ${
                op.disponible
                  ? "hover:shadow-lg hover:-translate-y-1"
                  : "opacity-60"
              }
            `}
          >
            {/* Icono + texto */}
            <div className="flex items-start gap-4 md:max-w-2/3 w-auto lg:w-auto">
              {iconMap[op.color]}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {op.titulo}
                  {!op.disponible && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Próximamente
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{op.descripcion}</p>
              </div>
            </div>

            {/* Botón */}
            {op.disponible ? (
              <Link
                href={op.href}
                className="
                  inline-flex items-center justify-center gap-2
                  w-full md:w-auto
                  px-6 py-3
                  rounded-xl
                  bg-blue-600 text-white
                  text-sm font-medium
                  hover:bg-blue-700
                  transition
                "
              >
                Ejecutar consulta
                <IconArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div
                className="
                  inline-flex items-center justify-center gap-2
                  w-full md:w-auto
                  px-6 py-3
                  rounded-xl
                  bg-gray-100 text-gray-400
                  text-sm font-medium
                  cursor-not-allowed
                "
              >
                <IconLock className="w-4 h-4" />
                No disponible
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
