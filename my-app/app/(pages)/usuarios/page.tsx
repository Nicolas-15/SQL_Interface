import { protectPage } from "@/app/lib/utils/auth-server";
import { connectToDB } from "@/app/lib/utils/db-connection";
import UsuariosClient, { User } from "./usuariosClient";

export const dynamic = "force-dynamic";

type DBUser = {
  id_usuario: string;
  nombre: string;
  usuario: string;
  email: string;
  activo: boolean | number;
  id_rol: string;
};

export async function getUsers(): Promise<User[]> {
  const db = await connectToDB("");
  if (!db) throw new Error("No DB connection");

  const result = await db.request().query(`
      SELECT u.id_usuario, u.nombre, u.usuario, u.email, u.activo, u.id_rol, r.nombre_rol
      FROM usuario u
      LEFT JOIN [app_Interface].[dbo].[rol] r ON r.id_rol = u.id_rol
    `);

  return (result.recordset as (DBUser & { nombre_rol?: string })[]).map(
    (u) => ({
      id: u.id_usuario,
      name: u.nombre,
      usuario: u.usuario,
      email: u.email,
      rol: u.nombre_rol || "Sin rol",
      estado: Boolean(u.activo) ? "Activo" : "Inactivo",
    }),
  );
}

export default async function UsuariosPage() {
  await protectPage("/usuarios");

  const users = await getUsers();
  return <UsuariosClient initialUsers={users} />;
}
