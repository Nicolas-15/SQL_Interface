"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconHome } from "@tabler/icons-react";

const routeLabels: Record<string, string> = {
  consultas: "Gestión Financiera",
  usuarios: "Usuarios",
  titulares: "Firmantes",
  "intercambiar-titular": "Intercambiar Titular",
  "reporte-transparencia": "Reporte Transparencia",
  "regularizar-folio": "Regularizar Folio",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/login/")
  )
    return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      <Link
        href="/"
        className="hover:text-blue-600 transition flex items-center gap-1"
      >
        <IconHome className="w-4 h-4" />
        <span>Inicio</span>
      </Link>

      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <IconChevronRight className="w-3.5 h-3.5 text-gray-300" />
          {crumb.isLast ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-blue-600 transition">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
