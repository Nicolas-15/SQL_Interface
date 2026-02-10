import { connectToDB } from "@/app/lib/utils/db-connection";
import UsuariosClient, { User } from "./usuariosClient";

type DBUser = {
  id_usuario: string;
  nombre: string;
  email: string;
  activo: number;
  id_rol: string;
};

const roleMap: Record<string, string> = {
  "1A139223-1FCD-416C-B8FF-0F19BD52C986": "Admin",
};

export async function getUsers(): Promise<User[]> {
  const db = await connectToDB();
  if (!db) throw new Error("No DB connection");

  const result = await db
    .request()
    .query("SELECT id_usuario, nombre, email, activo, id_rol FROM usuario");

  return (result.recordset as DBUser[]).map((u) => ({
    id: u.id_usuario,
    name: u.nombre,
    email: u.email,
    rol: roleMap[u.id_rol] || "Viewer",
    estado: u.activo === 1 ? "Activo" : "Inactivo",
  }));
}

export default async function UsuariosPage() {
  const users = await getUsers();
  return <UsuariosClient initialUsers={users} />;
}
