"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import {
  IconUser,
  IconMenu2,
  IconX,
  IconLayout2,
  IconUsers,
  IconClipboardList,
  IconReceiptDollar,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useUser } from "@/app/context/UserContext";
import { useState } from "react";
import ProfileModal from "./ProfileModal";
import { getNavLinks } from "@/app/lib/utils/roles.config";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  const navLinks = getNavLinks(user?.nombre_rol ?? null);

  const iconMap: Record<string, any> = {
    "/consultas": IconLayout2,
    "/usuarios": IconUsers,
    "/titulares": IconClipboardList,
    "/consultas/regularizacion": IconReceiptDollar,
    "/auditoria": IconShieldCheck,
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 xl:px-0">
        <div className="flex justify-between items-center h-18 py-4">
          {/* Logo / Marca */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Abrir menú"
              >
                <IconMenu2 className="w-6 h-6 text-gray-700" />
              </button>
            )}
            <Link
              href="/"
              className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition"
            >
              APLI<span className="text-blue-600">CAS</span>
            </Link>
          </div>

          {/* Zona derecha */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <IconUser className="w-4 h-4 text-gray-400" />
                  <span className="font-medium hidden sm:inline">
                    {user.nombre}
                  </span>
                </button>

                {showProfile && (
                  <ProfileModal
                    user={{
                      nombre: user.nombre,
                      email: user.email,
                      usuario: user.usuario,
                    }}
                    onClose={() => setShowProfile(false)}
                  />
                )}
              </>
            )}
            {user && <LogoutButton />}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && user && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xl font-bold">Menú</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IconX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = iconMap[link.href] || IconLayout2;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 focus-within:ring-2">
                  {user.nombre.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[160px]">
                    {user.nombre}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.nombre_rol}
                  </span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
