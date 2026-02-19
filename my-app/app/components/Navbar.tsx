// Navbar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { tieneAcceso } from "@/app/lib/utils/roles.config";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const allLinks = [
    { href: "/consultas", label: "Consultas" },
    { href: "/usuarios", label: "Usuarios" },
    { href: "/titulares", label: "Titulares" },
    { href: "/tesoreria/regularizacion", label: "Tesorería" },
  ];

  // Filtrar links según el rol del usuario
  const links = allLinks.filter((link) =>
    tieneAcceso(user?.nombre_rol ?? null, link.href),
  );

  if (links.length === 0) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-4 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
