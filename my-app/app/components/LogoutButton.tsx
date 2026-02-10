"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/lib/action/auth/logout.action";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-white border border-blue-600 rounded-lg hover:text-blue-600 transition"
    >
      Logout
    </button>
  );
}
