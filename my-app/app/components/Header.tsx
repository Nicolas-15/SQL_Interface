"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-18 py-4">
          {/* Logo / Marca */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition"
          >
            SQL <span className="text-blue-600">Interface</span>
          </Link>

          {/* Zona derecha */}
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
