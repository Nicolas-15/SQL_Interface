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

{/*Esta es la fuente de lo que se muestra en pantalla.
  Tabla de usuarios de ejemplo con acciones de agregar, editar y eliminar.*/}

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

  {/*Controlamos si la ventana flotante aparece sobre la pagina */}
  const [isModalOpen, setIsModalOpen] = useState(false);

  {/*Nos dice que usario estamos editando para rellenar los campos del formulario*/}
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  /*ACCIONES*/
  {/*Creamos un nuevo usuario */}
  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now(),
      name: "Nuevo Usuario",
      email: "nuevo@ejemplo.com",
      rol: "Viewer",
      estado: "Activo",
    };

    {/*Seteamos un array para los nuevo usuarios*/}
    setUsers([...users, newUser]);
  };
  {/*Se abre el panel y cargamos los datos del usuario seleccionado preparando la edicion */}
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  {/*Guardamos los cambios realizados en el usuario seleccionado,
    remplazando al usuario antiguo en la lista */}
  const handleSaveUser = () => {
    if (!selectedUser) return;

    setUsers(
      users.map((user) =>
        user.id === selectedUser.id ? selectedUser : user
      )
    );
    {/*Cerramos el panel y limpiamos el usuario seleccionado*/}
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  {/*Eliminamos el usuario seleccionado de la lista*/}
  const handleDeleteUser = (id: number) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    {/*filter nos devuelve el array nuevo sin el usuario eliminado */}
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-4xl font-bold mb-6 text-black">Usuarios</h1>

      {/*Boton para agregar usuarios*/}
      <button
        onClick={handleAddUser}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-8"
      >
        + Nuevo Usuario
      </button>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="min-w-200 w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Rol</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{user.name}</td>
                <td className="px-6 py-3 text-gray-600">{user.email}</td>
                <td className="px-6 py-3 text-gray-600">{user.rol}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.estado === "Activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.estado}
                  </span>
                </td>
                <td className="px-6 py-3 flex gap-4">
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

      {/* MODAL */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <IconX />
            </button>

            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>

            <div className="space-y-3">
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
                placeholder="Nombre"
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                placeholder="Email"
              />

              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedUser.rol}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, rol: e.target.value })
                }
              >
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>

              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedUser.estado}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    estado: e.target.value as "Activo" | "Inactivo",
                  })
                }
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
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
