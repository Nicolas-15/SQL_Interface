import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Breadcrumbs from "./components/Breadcrumbs";
import React from "react";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "@/app/context/UserContext";
import { cookies } from "next/headers";
import { verificarJWT } from "./lib/utils/jwt";
import { UsuarioRepository } from "./repositories/user.repository";
import type { SessionUser } from "./lib/action/auth/session.action";

export const metadata: Metadata = {
  title: "ApliCAS",
  description: "Aplicaciones de gestión municipal",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userData: SessionUser | null = null;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    try {
      const payload = verificarJWT(token) as { id_usuario?: string };
      if (payload.id_usuario) {
        const repo = new UsuarioRepository();
        const usuario = await repo.findById(payload.id_usuario);
        if (usuario && usuario.activo) {
          userData = {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            nombre_rol: usuario.nombre_rol ?? null,
          };
        }
      }
    } catch {}
  }

  return (
    <html lang="es">
      <body className="flex flex-col bg-gray-50 text-black relative">
        <UserProvider initialUser={userData}>
          <Header />

          <main className="max-w-7xl flex-1 w-full mx-auto px-2 xl:px-0 min-h-screen relative">
            <div className="min-h-dvh grow py-15">
              <Breadcrumbs />
              {children}
            </div>
          </main>

          <Footer />

          <ToastContainer
            position="bottom-right"
            newestOnTop
            closeOnClick={false}
            draggable={false}
            pauseOnFocusLoss={false}
            style={{ marginTop: "4rem" }}
          />
        </UserProvider>
      </body>
    </html>
  );
}
