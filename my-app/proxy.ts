import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarJWT } from "./app/lib/utils/jwt";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir login sin token
  if (pathname === "/login") {
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
    verificarJWT(token);
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
