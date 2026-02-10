// app/components/Header.tsx
"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm px-2 xl:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black">
            SQL Interface
          </Link>

          {/* Botón de Logout */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
