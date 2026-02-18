"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { IconUser } from "@tabler/icons-react";

interface HeaderProps {
  isLoggedIn: boolean;
  userName?: string;
}

export default function Header({ isLoggedIn, userName }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 xl:px-0">
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
            {isLoggedIn && userName && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <IconUser className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{userName}</span>
              </div>
            )}
            {isLoggedIn && <LogoutButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
