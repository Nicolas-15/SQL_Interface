"use client";

import { useState } from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";

export type User = {
  id: string;
  name: string;
  email: string;
  rol: string;
  estado: "Activo" | "Inactivo";
};

interface Props {
  initialUsers: User[];
}

export default function UsuariosClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const capitalizeName = (name: string) =>
    name.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleNameChange = (name: string) => {
    if (!tempUser) return;
    name = capitalizeName(name).slice(0, 50);
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
    email = email.toLowerCase().slice(0, 50);
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
      id: Date.now().toString(),
      name: "",
      email: "",
      rol: "Viewer",
      estado: "Activo",
    });
    setErrors({ name: "", email: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setTempUser({ ...user });
    setErrors({ name: "", email: "" });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!tempUser || errors.name || errors.email) return;

    if (isEditing) {
      setUsers(users.map((u) => (u.id === tempUser.id ? tempUser : u)));
    } else {
      setUsers([...users, tempUser]);
    }

    setTempUser(null);
    setShowModal(false);
  };

  const handleDeleteUser = (id: string) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-black">
        Usuarios
      </h1>
      <div className="flex justify-center mb-6">
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Agregar Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto w-full bg-white border rounded-lg shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Rol</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-3 py-2">{user.name}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.rol}</td>
                <td className="px-3 py-2">{user.estado}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => handleEditUser(user)}>
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    <IconTrash className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && tempUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Editar Usuario" : "Agregar Usuario"}
            </h2>

            <div className="mb-4">
              <label className="block mb-1">Nombre</label>
              <input
                type="text"
                value={tempUser.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={tempUser.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
