"use client";

import { useState, useEffect } from "react";
import {
  crearUsuarioAction,
  actualizarUsuarioAction,
  eliminarUsuarioAction,
} from "@/app/lib/action/auth/usuarios.action";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

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
      id: "",
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

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;

    const result = await eliminarUsuarioAction(id);

    if (result?.error) {
      alert(result.error);
      return;
    }

    // Eliminación inmediata en frontend
    setUsers((prev) => prev.filter((u) => u.id !== id));

    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-black">
        Lista de usuarios registrados
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Aquí puedes visualizar, editar o eliminar los usuarios registrados en el
        sistema.
      </p>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Agregar Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Nombre</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Rol</th>
              <th className="border border-gray-300 p-2">Estado</th>
              <th className="border border-gray-300 p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border border-gray-300 p-2">{user.name}</td>
                <td className="border border-gray-300 p-2">{user.email}</td>
                <td className="border border-gray-300 p-2">{user.rol}</td>
                <td className="border border-gray-300 p-2">{user.estado}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleEditUser(user)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && tempUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Editar Usuario" : "Agregar Usuario"}
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                let result;

                if (isEditing && tempUser?.id) {
                  formData.append("id_usuario", tempUser.id);
                  result = await actualizarUsuarioAction(formData);
                } else {
                  result = await crearUsuarioAction(formData);
                }

                if (result?.error) {
                  alert(result.error);
                  return;
                }

                setShowModal(false);

                router.refresh();
              }}
            >
              {/* NOMBRE */}
              <div className="mb-4">
                <label className="block mb-1">Nombre</label>
                <input
                  name="nombre"
                  type="text"
                  value={tempUser.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={tempUser.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* ROL */}
              <div className="mb-4">
                <label className="block mb-1">Rol</label>
                <select
                  name="rol"
                  value={tempUser.rol}
                  onChange={(e) =>
                    setTempUser({ ...tempUser, rol: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* ESTADO */}
              <div className="mb-4">
                <label className="block mb-1">Estado</label>
                <select
                  name="estado"
                  value={tempUser.estado}
                  onChange={(e) =>
                    setTempUser({
                      ...tempUser,
                      estado: e.target.value as "Activo" | "Inactivo",
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              {/* BOTONES */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
