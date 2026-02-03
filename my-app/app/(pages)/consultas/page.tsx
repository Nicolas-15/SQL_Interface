import {IconEdit, IconTrash} from '@tabler/icons-react';
export default function Consultas() {
  const queries = [
    { id: 1, name: "Query 1", created: "2026-01-15", status: "Activa" },
    { id: 2, name: "Query 2", created: "2026-01-20", status: "Archivada" },
    { id: 3, name: "Query 3", created: "2026-02-01", status: "Activa" },
  ];

  return (
    <div>
      <h1 className="titulo text-4xl font-bold mb-8">Seleccione una operacion</h1>
      <h2 className="text-xl text-gray-600 mb-6">Operaciones disponibles:</h2>
      <button className="mb-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
        + Nueva Consulta
      </button>

      <div className="tablacmp bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Creada</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((query) => (
              <tr key={query.id} className="tablanc border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 text-black">{query.name}</td>
                <td className="px-6 py-3 text-gray-600">{query.created}</td>
                <td className="px-6 py-3">
                  <span
                    className={`status px-3 py-1 rounded text-sm font-medium ${
                      query.status === "Activa"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {query.status}
                  </span>
                </td>
                <td className="Acciones px-6 py-3">
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
