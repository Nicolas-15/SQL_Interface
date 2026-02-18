"use client";

import { useState, useEffect } from "react";
import {
  crearUsuarioAction,
  actualizarUsuarioAction,
  eliminarUsuarioAction,
} from "@/app/lib/action/auth/usuarios.action";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { ROLES_LIST, ROLE_LABELS } from "@/app/lib/utils/roles.config";

import { toast } from "react-toastify";
import ConfirmationToast from "@/app/components/ConfirmationToast";

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
  const { refreshUser } = useUser();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

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
      rol: "admin",
      estado: "Activo",
    });

    setPassword("");
    setErrors({ name: "", email: "", password: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setTempUser({ ...user });
    setPassword("");
    setErrors({ name: "", email: "", password: "" });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    toast(
      ({ closeToast }) => (
        <ConfirmationToast
          message="¿Eliminar este usuario? Si tiene registros de auditoría, será desactivado."
          onConfirm={async () => {
            const result = await eliminarUsuarioAction(id);

            if (result?.error) {
              toast.error(result.error);
              return;
            }

            await refreshUser();
            router.refresh();
            toast.info(result.message || "Operación completada", {
              autoClose: 5000,
            });
          }}
          closeToast={closeToast}
        />
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        className: "p-0 bg-transparent shadow-none",
      },
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      {/* Header sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 py-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black">
            Lista de usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los usuarios registrados en el sistema.
          </p>
        </div>

        <button
          onClick={handleAddUser}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
        />
        <p className="text-sm text-gray-500">
          Mostrando{" "}
          <span className="font-semibold text-gray-700">
            {filteredUsers.length}
          </span>{" "}
          de <span className="font-semibold text-gray-700">{users.length}</span>{" "}
          usuarios
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-gray-400 text-sm">
                    No se encontraron usuarios
                    {search && (
                      <span>
                        {" "}
                        para "
                        <span className="font-medium text-gray-600">
                          {search}
                        </span>
                        "
                      </span>
                    )}
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.rol}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.estado === "Activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs transition"
                      onClick={() => handleEditUser(user)}
                    >
                      Editar
                    </button>

                    <button
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-xs transition"
                      title="Enviar correo de recuperación de contraseña"
                      onClick={async () => {
                        if (
                          !confirm(
                            `¿Generar nueva contraseña aleatoria y enviarla a ${user.name} (${user.email})?`,
                          )
                        )
                          return;

                        const { enviarRecuperacionAction } =
                          await import("@/app/lib/action/auth/usuarios.action");

                        toast.info("Enviando correo...");
                        const result = await enviarRecuperacionAction(
                          user.email,
                        );

                        if (result.success) {
                          toast.success(result.message);
                        } else {
                          toast.error(result.error || "Error al enviar correo");
                        }
                      }}
                    >
                      Recuperar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs transition"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && tempUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6">
              {isEditing ? "Editar Usuario" : "Agregar Usuario"}
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                toast(
                  ({ closeToast }) => (
                    <ConfirmationToast
                      message={
                        isEditing
                          ? "¿Guardar cambios del usuario?"
                          : "¿Crear nuevo usuario?"
                      }
                      onConfirm={async () => {
                        let result;

                        if (isEditing && tempUser?.id) {
                          formData.append("id_usuario", tempUser.id);
                          result = await actualizarUsuarioAction(formData);
                        } else {
                          result = await crearUsuarioAction(formData);
                        }

                        if (result?.error) {
                          toast.error(result.error);
                          return;
                        }

                        setShowModal(false);
                        await refreshUser();
                        router.refresh();
                        toast.success(
                          isEditing
                            ? "Usuario actualizado correctamente"
                            : "Usuario creado correctamente",
                        );
                      }}
                      closeToast={closeToast}
                    />
                  ),
                  {
                    position: "top-center",
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    hideProgressBar: true,
                    className: "p-0 bg-transparent shadow-none",
                  },
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 text-sm font-medium">Nombre</label>
                <input
                  name="nombre"
                  type="text"
                  value={tempUser.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={tempUser.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {!isEditing && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Contraseña
                  </label>
                  <input
                    name="password"
                    type="text"
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      setErrors((prev) => ({
                        ...prev,
                        password: val.length < 6 ? "Mínimo 6 caracteres" : "",
                      }));
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium">Rol</label>
                <select
                  name="rol"
                  value={tempUser.rol}
                  onChange={(e) =>
                    setTempUser({ ...tempUser, rol: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES_LIST.map((rol) => (
                    <option key={rol} value={rol}>
                      {ROLE_LABELS[rol]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Estado</label>
                <select
                  name="estado"
                  value={tempUser.estado}
                  onChange={(e) =>
                    setTempUser({
                      ...tempUser,
                      estado: e.target.value as "Activo" | "Inactivo",
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
