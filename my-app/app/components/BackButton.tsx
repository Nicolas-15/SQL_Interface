// BackButton.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar en home ni login
  if (pathname === "/" || pathname === "/login") return null;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back(); // Usa historial del navegador
    } else {
      router.push("/"); // Si no hay historial, va a home
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-600 text-black rounded-lg hover:text-blue-600 transition"
    >
      <IconArrowLeft className="w-5 h-5" />
      Volver
    </button>
  );
}
