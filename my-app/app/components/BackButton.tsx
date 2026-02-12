"use client";
import { useRouter, usePathname } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") return null;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
    >
      <IconArrowLeft className="w-4 h-4" />
      Volver
    </button>
  );
}
