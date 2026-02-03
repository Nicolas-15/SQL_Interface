import { IconEdit } from "@tabler/icons-react";

export default function Titulares() {
  const titulares = [
    { id: 1, cargo: "Alcalde/sa", nombre: "Roberto Sánchez", email: "roberto.sanchez@municipio.cl" },
    { id: 2, cargo: "Administrador/a", nombre: "Patricia Contreras", email: "patricia.contreras@municipio.cl" },
  ];

  return (
    <div>
      <h1 className="titulo text-4xl font-bold mb-8">Titulares</h1>

      <div className="tablacmp bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Titular</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Cargo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {titulares.map((t) => (
              <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 text-black font-medium">{t.nombre}</td>
                <td className="px-6 py-3 text-gray-600">{t.cargo}</td>
                <td className="px-6 py-3 text-gray-600">{t.email}</td>
                <td className="edicion px-6 py-3">
                  <button className="text-black hover:text-gray-600"><IconEdit className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
