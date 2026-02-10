// app/(pages)/usuarios/page.tsx
import UsuariosClient, { User } from "./usuariosClient";
import { connectToDB } from "@/app/lib/utils/db-connection";

// Mapea id_rol a nombres legibles
const roleMap: Record<string, string> = {
  "1A139223-1FCD-416C-B8FF-0F19BD52C986": "Admin",
  // agrega otros id_rol si los hay
};

export default async function UsuariosPage() {
  const db = await connectToDB();
  if (!db) throw new Error("No se pudo conectar a la DB");

  const result = await db
    .request()
    .query(`SELECT nombre, email, activo, id_rol FROM usuario`);

  type DBUser = {
    nombre: string;
    email: string;
    activo: number;
    id_rol: string;
  };

  const users: User[] = (result.recordset as DBUser[]).map((u) => ({
    id: u.id_rol,
    name: u.nombre,
    email: u.email,
    rol: roleMap[u.id_rol] || "Viewer",
    estado: u.activo === 1 ? "Activo" : "Inactivo",
  }));

  return <UsuariosClient initialUsers={users} />;
}
