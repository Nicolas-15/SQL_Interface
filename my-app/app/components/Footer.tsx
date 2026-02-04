// Footer.tsx
"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-sky-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 text-center text-white text-sm">
          {/* Logo */}
          <div className="relative w-16 h-16">
            <Image
              src="/iconofooter.png"
              alt="Escudo Municipalidad"
              width={70}
              height={70}
              className="filter-[drop-shadow(0_0_4px_rgba(0,0,0,0.8))]"
            />
          </div>

          {/* Texto */}
          <p className="text-center text-white text-sm">
            &copy; {new Date().getFullYear()} SQL Interface.
            <br />
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
