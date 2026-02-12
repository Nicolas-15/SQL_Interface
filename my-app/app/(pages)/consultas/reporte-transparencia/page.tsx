"use client";
import { useState } from "react";

type Reporte = {
  fecha: string;
  folio: string;
  descripcion: string;
  monto: string;
  beneficiario: string;
  estado: string;
  comuna: string;
};

const columnasDisponibles: (keyof Reporte)[] = [
  "fecha",
  "folio",
  "descripcion",
  "monto",
  "beneficiario",
  "estado",
  "comuna",
];

export default function ReporteTransparencia() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comuna, setComuna] = useState("");
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [columnasSeleccionadas, setColumnasSeleccionadas] =
    useState<(keyof Reporte)[]>(columnasDisponibles);

  const generarReporte = () => {
    if (!fechaInicio || !fechaFin) {
      alert("Debe ingresar fecha inicio y fecha fin");
      return;
    }

    // Datos simulados conectar el backend
    const datosMock: Reporte[] = [
      {
        fecha: "2026-02-01",
        folio: "123456",
        descripcion: "Pago proveedor",
        monto: "250000",
        beneficiario: "Empresa ABC",
        estado: "Aprobado",
        comuna: "Providencia",
      },
      {
        fecha: "2026-02-05",
        folio: "789012",
        descripcion: "Servicio externo",
        monto: "180000",
        beneficiario: "Servicios SPA",
        estado: "Pendiente",
        comuna: "Santiago",
      },
    ];

    setReportes(datosMock);
  };

  const toggleColumna = (col: keyof Reporte) => {
    setColumnasSeleccionadas((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const exportarExcel = () => {
    const encabezados = columnasSeleccionadas.join(",");
    const filas = reportes.map((r) =>
      columnasSeleccionadas.map((col) => r[col]).join(","),
    );

    const contenido = [encabezados, ...filas].join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_transparencia.csv";
    link.click();
  };

  return (
    <div className="min-h-screen py-6 max-w-7xl mx-auto">
      {/* titulo pagina */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-black mb-2">
          Reporte de Transparencia
        </h1>
        <p className="text-gray-600 text-lg">
          Generación y exportación de información municipal
        </p>
      </section>

      {/* Cards con filtros*/}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          />
          <select
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          >
            <option value="">Todas las comunas (opcional)</option>
            <option value="Providencia">Providencia</option>
            <option value="Santiago">Santiago</option>
            <option value="Las Condes">Las Condes</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={generarReporte}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Seleccionar las comunas*/}
      {reportes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Seleccionar columnas a exportar
          </h2>
          <div className="flex flex-wrap gap-4">
            {columnasDisponibles.map((col) => (
              <label key={col} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={columnasSeleccionadas.includes(col)}
                  onChange={() => toggleColumna(col)}
                />
                {col.toUpperCase()}
              </label>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-all duration-300"
            >
              Exportar a Excel
            </button>
          </div>
        </div>
      )}

      {/* Tabla*/}
      {reportes.length > 0 && (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                {columnasDisponibles.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportes.map((r, i) => (
                <tr key={i} className="border-t">
                  {columnasDisponibles.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm">
                      {r[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
