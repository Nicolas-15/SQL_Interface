import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-cc-text md:text-8xl">
          404
        </h1>

        <h2 className="mb-3 text-2xl font-semibold text-cc-text md:text-3xl">
          Página no encontrada
        </h2>

        <p className="mb-8 max-w-md text-pretty text-white md:text-lg">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[#1e2ab0] px-6 py-3 text-base font-medium text-white hover:bg-cc-primary md:text-lg hover:scale-105 active:scale-95 transition-all duration-100"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
