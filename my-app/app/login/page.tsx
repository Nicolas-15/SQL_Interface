// app/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./loginForm";

export default async function LoginPage() {
  const cookieStore = await cookies(); // ⚡ IMPORTANTE: await aquí
  const token = cookieStore.get("auth_token")?.value; // ahora sí funciona

  if (token) {
    redirect("/"); // ya logueado → redirige al dashboard
  }

  return <LoginForm />;
}
