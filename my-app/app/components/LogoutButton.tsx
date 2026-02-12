"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/lib/action/auth/logout.action";
import { IconLogout } from "@tabler/icons-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
    >
      <IconLogout className="w-4 h-4" />
      Cerrar sesión
    </button>
  );
}
