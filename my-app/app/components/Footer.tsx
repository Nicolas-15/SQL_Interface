// Footer.tsx
"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-black relative overflow-hidden mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Glow azul desde arriba */}
        <div className="absolute top-0 mx-auto left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[60px] -translate-y-1/2" />

        <div className="absolute top-0 mx-auto right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[60px] -translate-y-1/2" />

        {/* Glow púrpura desde abajo */}
        <div className="absolute bottom-0 mx-auto left-1/3 w-[125] h-[125] bg-purple-600/10 rounded-full blur-[75px] translate-y-1/2" />

        {/* Gradiente sutil sobre el contenido */}
        <div className="absolute inset-0 mx-auto bg-linear-to-b from-zinc-900/50 via-transparent to-zinc-900/30" />

        <div className="flex flex-col items-center gap-4 text-center text-white text-sm">
          {/* Logo */}
          <div className="relative pt-4">
            <Image
              src="/iconofooter.png"
              alt="Escudo Municipalidad"
              width={90}
              height={90}
            />
          </div>
          {/* Texto */}
          <p className="text-center text-white text-sm">
            &copy; {new Date().getFullYear()} APLICAS
            <br />
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
