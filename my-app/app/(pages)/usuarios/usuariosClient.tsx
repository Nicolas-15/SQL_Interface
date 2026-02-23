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
import {
  IconSearchOff,
  IconUser,
  IconMail,
  IconUserShield,
  IconCircleCheck,
  IconLockAccess,
} from "@tabler/icons-react";

export type User = {
  id: string;
  name: string;
  usuario: string;
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
  const [errors, setErrors] = useState<{
    name?: string;
    usuario?: string;
    email?: string;
  }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.usuario.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Handlers de cambio con validaciones
  const handleNameChange = (val: string) => {
    if (val.length > 100) return;
    setTempUser((prev) => (prev ? { ...prev, name: val } : null));
    if (val.trim().length < 3) {
      setErrors((prev) => ({
        ...prev,
        name: "El nombre debe tener al menos 3 caracteres.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleUsernameChange = (val: string) => {
    // Restricción estricta de 6 caracteres
    if (val.length > 6) return;

    // Solo permitir alfanuméricos según buenas prácticas para usernames cortos
    const cleanVal = val.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    setTempUser((prev) => (prev ? { ...prev, usuario: cleanVal } : null));

    if (cleanVal.length === 0) {
      setErrors((prev) => ({
        ...prev,
        usuario: "El usuario es obligatorio.",
      }));
    } else if (cleanVal.length < 3) {
      setErrors((prev) => ({
        ...prev,
        usuario: "Mínimo 3 caracteres.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, usuario: undefined }));
    }
  };

  const handleEmailChange = (val: string) => {
    if (val.length > 100) return;
    setTempUser((prev) => (prev ? { ...prev, email: val } : null));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setErrors((prev) => ({ ...prev, email: "Email inválido." }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleAddUser = () => {
    setTempUser({
      id: "",
      name: "",
      usuario: "",
      email: "",
      rol: "admin",
      estado: "Activo",
    });

    setPassword("");
    setErrors({});
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setTempUser({ ...user });
    setPassword("");
    setErrors({});
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
    <div className="max-w-7xl mx-auto py-6 sm:py-8">
      {/* Header sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black py-2">
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
          id="user-search"
          type="text"
          placeholder="Buscar por nombre, usuario o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
          aria-label="Buscar por nombre, usuario o email"
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
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Usuario</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Rol</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <IconSearchOff className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-lg font-medium text-gray-500">
                      No se encontraron usuarios
                    </p>
                    <p className="text-sm">
                      Prueba con otros términos de búsqueda
                    </p>
                  </div>
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
                  <td className="px-6 py-4 text-gray-600 italic">
                    {user.usuario}
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
                      title={`Editar usuario ${user.name}`}
                      aria-label={`Editar usuario ${user.name}`}
                    >
                      Editar
                    </button>

                    <button
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-xs transition"
                      title="Enviar correo de recuperación de contraseña"
                      onClick={() => {
                        toast(
                          ({ closeToast }) => (
                            <ConfirmationToast
                              message={`¿Generar nueva contraseña aleatoria y enviarla a ${user.name} (${user.email})?`}
                              onConfirm={async () => {
                                const { enviarRecuperacionAction } =
                                  await import("@/app/lib/action/auth/usuarios.action");

                                toast.info("Enviando correo...");
                                const result = await enviarRecuperacionAction(
                                  user.email,
                                );

                                if (result.success) {
                                  toast.success(result.message);
                                } else {
                                  toast.error(
                                    result.error || "Error al enviar correo",
                                  );
                                }
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
                    >
                      Recuperar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs transition"
                      onClick={() => handleDeleteUser(user.id)}
                      title={`Eliminar usuario ${user.name}`}
                      aria-label={`Eliminar usuario ${user.name}`}
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
              <div className="space-y-1">
                <label
                  htmlFor="user-name"
                  className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-700"
                >
                  <IconUser className="w-4 h-4 text-blue-500" />
                  Nombre Completo
                </label>
                <input
                  id="user-name"
                  name="nombre"
                  type="text"
                  value={tempUser.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={100}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 shadow-sm shadow-red-50"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300"
                  }`}
                  placeholder="Ej: Juan Pérez"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="user-usuario"
                  className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-700"
                >
                  <IconLockAccess className="w-4 h-4 text-blue-500" />
                  Nombre de Usuario
                </label>
                <input
                  id="user-usuario"
                  name="usuario"
                  type="text"
                  value={tempUser.usuario}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  maxLength={6}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                    errors.usuario
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 shadow-sm shadow-red-50"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300"
                  }`}
                  placeholder="Ej: jperez"
                  title="Máximo 6 caracteres alfanuméricos"
                  required
                />
                {errors.usuario ? (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.usuario}
                  </p>
                ) : (
                  <p className="text-gray-400 text-[10px] mt-1">
                    Límite: {tempUser.usuario.length}/6 caracteres
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="user-email"
                  className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-700"
                >
                  <IconMail className="w-4 h-4 text-blue-500" />
                  Correo Electrónico
                </label>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  value={tempUser.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  maxLength={100}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 shadow-sm shadow-red-50"
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300"
                  }`}
                  placeholder="ejemplo@correo.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              {!isEditing && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-800">
                  <p className="text-[11px] leading-tight">
                    <strong className="block text-blue-900 mb-0.5">
                      Nota de Seguridad:
                    </strong>
                    La contraseña se generará aleatoriamente y será enviada por
                    correo al crear el perfil.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="user-rol"
                    className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-700"
                  >
                    <IconUserShield className="w-4 h-4 text-blue-500" />
                    Rol
                  </label>
                  <select
                    id="user-rol"
                    name="rol"
                    value={tempUser.rol}
                    onChange={(e) =>
                      setTempUser({ ...tempUser, rol: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {ROLES_LIST.map((rol) => (
                      <option key={rol} value={rol}>
                        {ROLE_LABELS[rol]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="user-status"
                    className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-700"
                  >
                    <IconCircleCheck className="w-4 h-4 text-blue-500" />
                    Estado
                  </label>
                  <select
                    id="user-status"
                    name="estado"
                    value={tempUser.estado}
                    onChange={(e) =>
                      setTempUser({
                        ...tempUser,
                        estado: e.target.value as "Activo" | "Inactivo",
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition active:scale-95"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition active:scale-95"
                >
                  {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
