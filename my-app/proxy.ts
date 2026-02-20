import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarJWT } from "./app/lib/utils/jwt";
import { tieneAcceso } from "./app/lib/utils/roles.config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir login y sus sub-rutas sin token
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Obtener JWT desde cookie
  const token = request.cookies.get("auth_token")?.value;

  // Sin token → redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Validar JWT
    const payload = verificarJWT(token) as {
      nombre_rol?: string | null;
    };

    const nombreRol = payload.nombre_rol || null;

    // Verificar permisos de ruta
    // La página principal "/" es accesible para todos los roles
    if (pathname !== "/" && !tieneAcceso(nombreRol, pathname)) {
      // Redirigir al Home si no tiene acceso
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token inválido o expirado
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|css|js|map)$).*)",
  ],
};
