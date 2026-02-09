"use client";

import { useState } from "react";
import { IconEdit, IconTrash, IconX } from "@tabler/icons-react";

type User = {
  id: number;
  name: string;
  email: string;
  rol: string;
  estado: "Activo" | "Inactivo";
};

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Juan García",
      email: "juan@example.com",
      rol: "Admin",
      estado: "Activo",
    },
    {
      id: 2,
      name: "María López",
      email: "maria@example.com",
      rol: "Editor",
      estado: "Activo",
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      rol: "Viewer",
      estado: "Inactivo",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false); // Para saber si estamos editando o creando

  // Capitaliza cada palabra del nombre
  const capitalizeName = (name: string) =>
    name.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleNameChange = (name: string) => {
    if (!tempUser) return;
    name = capitalizeName(name).slice(0, 50); // Max length 50
    setTempUser({ ...tempUser, name });

    setErrors((prev) => ({
      ...prev,
      name:
        !name || name.trim().length < 3
          ? "Nombre debe tener al menos 3 caracteres"
          : "",
    }));
  };

  const handleEmailChange = (email: string) => {
    if (!tempUser) return;
    email = email.toLowerCase().slice(0, 50); // Max length 50
    setTempUser({ ...tempUser, email });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrors((prev) => ({
      ...prev,
      email: !email
        ? "Email obligatorio"
        : !emailRegex.test(email)
          ? "Email inválido"
          : "",
    }));
  };

  const handleAddUser = () => {
    setTempUser({
      id: Date.now(),
      name: "",
      email: "",
      rol: "Viewer",
      estado: "Activo",
    });
    setErrors({ name: "", email: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setTempUser({ ...user });
    setErrors({ name: "", email: "" });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!tempUser || errors.name || errors.email) return;

    if (isEditing) {
      // Editar usuario existente
      setUsers(users.map((u) => (u.id === tempUser.id ? tempUser : u)));
    } else {
      // Crear nuevo usuario
      setUsers([...users, tempUser]);
    }

    setTempUser(null);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: number) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-black">
        Usuarios
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Administración, modificación y eliminación de usuarios del sistema
      </p>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded w-full sm:w-auto text-center"
        >
          Agregar Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-2 text-left text-sm font-semibold text-black">
                Nombre
              </th>
              <th className="px-3 sm:px-6 py-2 text-left text-sm font-semibold text-black">
                Email
              </th>
              <th className="px-3 sm:px-6 py-2 text-left text-sm font-semibold text-black">
                Rol
              </th>
              <th className="px-3 sm:px-6 py-2 text-left text-sm font-semibold text-black">
                Estado
              </th>
              <th className="px-3 sm:px-6 py-2 text-left text-sm font-semibold text-black">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-2 font-medium">{user.name}</td>
                <td className="px-3 sm:px-6 py-2 text-gray-600 wrap-break-words">
                  {user.email}
                </td>
                <td className="px-3 sm:px-6 py-2 text-gray-600">{user.rol}</td>
                <td className="px-3 sm:px-6 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      user.estado === "Activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.estado}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-2 flex gap-2 sm:gap-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-black hover:text-gray-600"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && tempUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <IconX />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>

            <div className="space-y-3">
              <input
                id="user-name"
                name="name"
                maxLength={50}
                autoComplete="off"
                className={`w-full border rounded-lg px-3 py-2 ${errors.name ? "border-red-500" : ""}`}
                value={tempUser.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nombre"
              />
              <p className="text-red-600 text-sm min-h-5">
                {errors.name || "\u00A0"}
              </p>

              <input
                id="user-email"
                name="email"
                autoComplete="off"
                maxLength={50}
                className={`w-full border rounded-lg px-3 py-2 ${errors.email ? "border-red-500" : ""}`}
                value={tempUser.email || ""}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Email"
              />
              <p className="text-red-600 text-sm min-h-5">
                {errors.email || "\u00A0"}
              </p>

              <select
                id="user-rol"
                name="rol"
                className="w-full border rounded-lg px-3 py-2"
                value={tempUser.rol || "Viewer"}
                onChange={(e) =>
                  setTempUser({ ...tempUser, rol: e.target.value })
                }
              >
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>

              <select
                id="user-estado"
                name="estado"
                className="w-full border rounded-lg px-3 py-2"
                value={tempUser.estado || "Activo"}
                onChange={(e) =>
                  setTempUser({
                    ...tempUser,
                    estado: e.target.value as "Activo" | "Inactivo",
                  })
                }
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 w-full sm:w-auto"
                disabled={
                  !!errors.name ||
                  !!errors.email ||
                  !tempUser.name ||
                  !tempUser.email
                }
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
