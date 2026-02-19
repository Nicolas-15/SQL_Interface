"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { IconUser } from "@tabler/icons-react";
import { useUser } from "@/app/context/UserContext";
import { useState } from "react";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const { user } = useUser();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 xl:px-0">
        <div className="flex justify-between items-center h-18 py-4">
          {/* Logo / Marca */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition"
          >
            APLI<span className="text-blue-600">CAS</span>
          </Link>

          {/* Zona derecha */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <IconUser className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{user.nombre}</span>
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
    </header>
  );
}
