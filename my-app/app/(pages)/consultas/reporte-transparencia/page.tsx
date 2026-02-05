"use client"; 
// Indica que este componente se ejecuta en el cliente (Next.js App Router)

import { useState } from "react";

/*
  Tipo Reporte
  Define la estructura de cada registro de transparencia
*/
type Reporte = {
  fecha: string;          // Fecha del movimiento
  folio: string;          // Número de folio
  descripcion: string;    // Descripción del gasto
  monto: string;          // Monto asociado
  beneficiario: string;   // Persona o empresa beneficiada
  estado: string;         // Estado del pago
  comuna: string;         // Comuna asociada
};

export default function ReporteTransparencia() {
  /*
    Estado del formulario
    Guarda los valores que el usuario escribe en los inputs
  */
  const [form, setForm] = useState<Reporte>({
    fecha: "",
    folio: "",
    descripcion: "",
    monto: "",
    beneficiario: "",
    estado: "",
    comuna: "",
  });

  /*
    Estado de la tabla
    Guarda todos los reportes generados
  */
  const [reportes, setReportes] = useState<Reporte[]>([]);

  /*
    Función genérica para manejar cambios en inputs y selects
    Usa el atributo "name" para saber qué campo actualizar
  */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /*
    Función que se ejecuta al presionar "Generar reporte"
    - Valida campos obligatorios
    - Agrega el registro a la tabla
    - Limpia el formulario
  */
  const generarReporte = () => {
    if (!form.fecha || !form.folio || !form.comuna) {
      alert("Complete los campos obligatorios");
      return;
    }

    // Agrega el nuevo reporte a la lista
    setReportes([...reportes, form]);

    // Limpia el formulario después de guardar
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
    <div className="max-w-6xl mx-auto p-6 text-center">
      {/* TÍTULO */}
      <h1 className="text-2xl font-bold mb-1">
        Reporte de Información (Transparencia)
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Extraer información de transparencia por comuna y fechas
      </p>

      {/* FORMULARIO DE INGRESO */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">

        {/* Fecha (controlada con rango válido de años) */}
        <input
          type="date"
          name="fecha"
          min="2000-01-01"
          max="2099-12-31"
          value={form.fecha}
          onChange={handleChange}
          className="border rounded px-4 py-2"
        />

        {/* Folio (solo números, largo máximo 8) */}
        <input
          type="text"
          name="folio"
          placeholder="Folio"
          maxLength={8}
          pattern="[0-9]*"
          inputMode="numeric"
          value={form.folio}
          onChange={handleChange}
          className="border rounded px-4 py-2"
        />

        {/* Descripción del gasto */}
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="border rounded px-4 py-2"
        />

        {/* Monto (solo números positivos) */}
        <input
          type="number"
          name="monto"
          placeholder="Monto"
          min={0}
          max={999999999}
          value={form.monto}
          onChange={handleChange}
          className="border rounded px-4 py-2"
        />

        {/* Beneficiario */}
        <input
          type="text"
          name="beneficiario"
          placeholder="Beneficiario"
          value={form.beneficiario}
          onChange={handleChange}
          className="border rounded px-4 py-2"
        />

        {/* Estado del trámite */}
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="border rounded px-4 py-2"
        >
          <option value="">Estado</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Pendiente">Pendiente</option>
        </select>

        {/* Selección de comuna */}
        <select
          name="comuna"
          value={form.comuna}
          onChange={handleChange}
          className="border rounded px-4 py-2"
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

      {/* BOTÓN */}
      <button
        onClick={generarReporte}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-8"
      >
        Generar reporte
      </button>

      {/* TABLA DE RESULTADOS */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Fecha</th>
              <th className="border px-3 py-2">Folio</th>
              <th className="border px-3 py-2">Descripción</th>
              <th className="border px-3 py-2">Monto</th>
              <th className="border px-3 py-2">Beneficiario</th>
              <th className="border px-3 py-2">Estado</th>
              <th className="border px-3 py-2">Comuna</th>
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
                  <td className="border px-3 py-2">{r.fecha}</td>
                  <td className="border px-3 py-2">{r.folio}</td>
                  <td className="border px-3 py-2">{r.descripcion}</td>
                  <td className="border px-3 py-2">{r.monto}</td>
                  <td className="border px-3 py-2">{r.beneficiario}</td>
                  <td className="border px-3 py-2">{r.estado}</td>
                  <td className="border px-3 py-2">{r.comuna}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
