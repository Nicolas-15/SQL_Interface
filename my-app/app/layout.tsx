import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Breadcrumbs from "./components/Breadcrumbs";
import React from "react";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "SQL Interface",
  description: "Interfaz para consultar base de datos SQL",
};

import { cookies } from "next/headers";
import { verificarJWT } from "./lib/utils/jwt";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const isLoggedIn = !!token;

  let userName = "";
  if (token) {
    try {
      const payload = verificarJWT(token) as { nombre?: string };
      userName = payload.nombre || "";
    } catch {}
  }

  return (
    <html lang="es">
      <body className="flex flex-col bg-gray-50 text-black relative">
        <Header isLoggedIn={isLoggedIn} userName={userName} />

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
      </body>
    </html>
  );
}
