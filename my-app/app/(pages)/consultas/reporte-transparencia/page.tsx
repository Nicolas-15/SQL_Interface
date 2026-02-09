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

export default function ReporteTransparencia() {
  const [form, setForm] = useState<Reporte>({
    fecha: "",
    folio: "",
    descripcion: "",
    monto: "",
    beneficiario: "",
    estado: "",
    comuna: "",
  });

  const [reportes, setReportes] = useState<Reporte[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const generarReporte = () => {
    if (!form.fecha || !form.folio || !form.comuna) {
      alert("Complete los campos obligatorios");
      return;
    }
    setReportes([...reportes, form]);
    setForm({
      fecha: "",
      folio: "",
      descripcion: "",
      monto: "",
      beneficiario: "",
      estado: "",
      comuna: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
        Reporte de Información (Transparencia)
      </h1>
      <p className="text-gray-600 text-base sm:text-lg mb-6">
        Extraer información de transparencia por comuna y fechas
      </p>

      {/* FORMULARIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          name="fecha"
          min="2000-01-01"
          max="2099-12-31"
          value={form.fecha}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        />
        <input
          type="text"
          name="folio"
          placeholder="Folio"
          maxLength={8}
          pattern="[0-9]*"
          inputMode="numeric"
          value={form.folio}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        />
        <input
          type="number"
          name="monto"
          placeholder="Monto"
          min={0}
          max={999999999}
          value={form.monto}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        />
        <input
          type="text"
          name="beneficiario"
          placeholder="Beneficiario"
          value={form.beneficiario}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        />
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="">Estado</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
        <select
          name="comuna"
          value={form.comuna}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="">Seleccionar comuna</option>
          <option value="Providencia">Providencia</option>
          <option value="Santiago">Santiago</option>
          <option value="Las Condes">Las Condes</option>
          <option value="Ñuñoa">Ñuñoa</option>
          <option value="Macul">Macul</option>
          <option value="Peñalolén">Peñalolén</option>
        </select>
      </div>

      <button
        onClick={generarReporte}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-6"
      >
        Generar reporte
      </button>

      {/* TABLA RESPONSIVE */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 sm:px-3 py-2">Fecha</th>
              <th className="border px-2 sm:px-3 py-2">Folio</th>
              <th className="border px-2 sm:px-3 py-2">Descripción</th>
              <th className="border px-2 sm:px-3 py-2">Monto</th>
              <th className="border px-2 sm:px-3 py-2">Beneficiario</th>
              <th className="border px-2 sm:px-3 py-2">Estado</th>
              <th className="border px-2 sm:px-3 py-2">Comuna</th>
            </tr>
          </thead>
          <tbody>
            {reportes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No hay registros
                </td>
              </tr>
            ) : (
              reportes.map((r, i) => (
                <tr key={i}>
                  <td className="border px-2 sm:px-3 py-2">{r.fecha}</td>
                  <td className="border px-2 sm:px-3 py-2">{r.folio}</td>
                  <td className="border px-2 sm:px-3 py-2">{r.descripcion}</td>
                  <td className="border px-2 sm:px-3 py-2">{r.monto}</td>
                  <td className="border px-2 sm:px-3 py-2">{r.beneficiario}</td>
                  <td className="border px-2 sm:px-3 py-2">{r.estado}</td>
                  <td className="border px-2 sm:px-3 py-2">{r.comuna}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
