// Navbar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { getNavLinks } from "@/app/lib/utils/roles.config";
import {
  IconLayout2,
  IconUsers,
  IconClipboardList,
  IconReceiptDollar,
  IconShieldCheck,
} from "@tabler/icons-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) return null;

  const navLinks = getNavLinks(user?.nombre_rol ?? null);

  const iconMap: Record<string, any> = {
    "/consultas": IconLayout2,
    "/usuarios": IconUsers,
    "/titulares": IconClipboardList,
    "/consultas/regularizacion": IconReceiptDollar,
    "/auditoria": IconShieldCheck,
  };

  const links = navLinks.map((link) => ({
    ...link,
    icon: iconMap[link.href] || IconLayout2,
  }));

  return (
    <nav className="hidden lg:block bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-2 py-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
