import { getSessionUserAction } from "@/app/lib/action/auth/session.action";
import { tieneAcceso } from "./roles.config";
import { redirect } from "next/navigation";

export class AuthorizationError extends Error {
  constructor(message = "Acceso denegado. No tiene permisos suficientes.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Verifica si el usuario actual tiene acceso a una ruta.
 * Diseñado para ser usado en Server Components (Pages).
 * Si no tiene acceso, redirige a /consultas o /login.
 */
export async function protectPage(route: string) {
  const user = await getSessionUserAction();

  if (!user) {
    redirect("/login");
  }

  if (!tieneAcceso(user.nombre_rol, route)) {
    redirect("/consultas");
  }

  return user;
}

/**
 * Verifica si el usuario actual tiene acceso a ejecutar una acción vinculada a una ruta.
 * Diseñado para ser usado en Server Actions.
 * Si no tiene acceso, lanza un AuthorizationError.
 */
export async function protectAction(route: string) {
  const user = await getSessionUserAction();

  if (!user) {
    throw new AuthorizationError("No autenticado.");
  }

  if (!tieneAcceso(user.nombre_rol, route)) {
    throw new AuthorizationError();
  }

  return user;
}
