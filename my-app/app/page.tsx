// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomePage from "./(pages)/page";

export default async function DashboardPage() {
  const cookieStore = await cookies(); // ⚡ await
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login"); // si no hay token → login
  }

  return <HomePage />; // si hay token → dashboard
}
