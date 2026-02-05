// Header.tsx
"use client";
import Link from "next/link";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/login");
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm px-2 xl:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black">
            SQL Interface
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-600 text-black rounded-lg hover:text-blue-600 transition"
          >
            <IconLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
