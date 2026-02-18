// app/login/page.tsx
import { redirect } from "next/navigation";
import LoginForm from "./loginForm";
import { getSessionUserAction } from "@/app/lib/action/auth/session.action";

export default async function LoginPage() {
  // Solo redirigir si hay un usuario válido Y activo
  const sessionUser = await getSessionUserAction();

  if (sessionUser) {
    redirect("/");
  }

  // Sin token, token inválido, o usuario inactivo → mostrar login
  return <LoginForm />;
}
