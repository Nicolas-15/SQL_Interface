import {IconEdit, IconTrash} from '@tabler/icons-react';
export default function Usuarios() {
  const users = [
    { id: 1, name: "Juan García", email: "juan@example.com", rol: "Admin", estado: "Activo" },
    { id: 2, name: "María López", email: "maria@example.com", rol: "Editor", estado: "Activo" },
    { id: 3, name: "Carlos Rodríguez", email: "carlos@example.com", rol: "Viewer", estado: "Inactivo" },
  ];

  return (
    <div>
      <h1 className="titulo text-4xl font-bold mb-8">Usuarios</h1>

      <button className="boton+ mb-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
        + Nuevo Usuario
      </button>

      <div className="tablacmp bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
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
              <tr key={user.id} className="nom-email border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 text-black font-medium">{user.name}</td>
                <td className="px-6 py-3 text-gray-600">{user.email}</td>
                <td className="px-6 py-3 text-gray-600">{user.rol}</td>
                <td className="px-6 py-3">
                  <span
                    className={`status px-3 py-1 rounded text-sm font-medium ${
                      user.estado === "Activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.estado}
                  </span>
                </td>
                <td className="edicion px-6 py-3">
                  <button className="text-black hover:text-gray-600 mr-4"><IconEdit className="w-4 h-4" /></button>
                  <button className="text-red-600 hover:text-red-800"><IconTrash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
