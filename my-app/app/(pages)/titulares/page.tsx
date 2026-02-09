"use client";

import { useState } from "react";
import { IconEdit, IconX } from "@tabler/icons-react";

type Titular = {
  id: number;
  cargo: string;
  nombre: string;
  rut: string;
};

export default function Titulares() {
  const [titulares, setTitulares] = useState<Titular[]>([
    {
      id: 1,
      cargo: "Alcalde/sa",
      nombre: "José Jofré Bustos",
      rut: "12.514.325-3",
    },
    {
      id: 2,
      cargo: "Administrador/a",
      nombre: "Diana Andrea Berrios Canelo",
      rut: "16.510.679-2",
    },
  ]);

  const [titularActivo, setTitularActivo] = useState<Titular | null>(null);
  const [errorRut, setErrorRut] = useState<string>("");

  // Función para validar RUT chileno
  const validarRut = (rut: string): boolean => {
    const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(rutLimpio)) return false;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvCalculado = "";

    if (dvEsperado === 11) dvCalculado = "0";
    else if (dvEsperado === 10) dvCalculado = "K";
    else dvCalculado = dvEsperado.toString();

    return dvCalculado === dv;
  };

  // Formatear RUT: 12345678K -> 12.345.678-K
  const formatearRut = (rut: string) => {
    const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (rutLimpio.length <= 1) return rutLimpio;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${cuerpoFormateado}-${dv}`;
  };

  // Manejar input del RUT
  const handleRutChange = (valor: string) => {
    if (!titularActivo) return;

    // Limpiar caracteres inválidos (solo números y K)
    let rutLimpio = valor.replace(/[^0-9kK]/g, "").toUpperCase();

    // Limitar longitud: hasta 8 dígitos + DV
    if (rutLimpio.length > 9) rutLimpio = rutLimpio.slice(0, 9);

    const rutFormateado = formatearRut(rutLimpio);

    setTitularActivo({ ...titularActivo, rut: rutFormateado });

    // Validación inmediata
    if (!rutFormateado) setErrorRut("");
    else if (!validarRut(rutFormateado)) setErrorRut("RUT inválido");
    else setErrorRut("");
  };

  const handleGuardar = () => {
    if (!titularActivo) return;

    if (!titularActivo.rut || errorRut) {
      alert("Ingrese un RUT válido antes de guardar");
      return;
    }

    setTitulares((prev) =>
      prev.map((t) => (t.id === titularActivo.id ? titularActivo : t)),
    );
    setTitularActivo(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl text-center font-bold mb-4 text-black">
        Titulares
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Administración de titulares autorizados para Decretos de Pago Web
      </p>

      <div className="overflow-x-auto w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-2 text-left font-semibold text-black">
                Titular
              </th>
              <th className="px-3 sm:px-6 py-2 text-left font-semibold text-black">
                Cargo
              </th>
              <th className="px-3 sm:px-6 py-2 text-left font-semibold text-black">
                RUT
              </th>
              <th className="px-3 sm:px-6 py-2 text-center font-semibold text-black">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {titulares.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-2 font-medium">{t.nombre}</td>
                <td className="px-3 sm:px-6 py-2 text-gray-600">{t.cargo}</td>
                <td className="px-3 sm:px-6 py-2 text-gray-600">{t.rut}</td>
                <td className="px-3 sm:px-6 py-2 flex justify-center">
                  <button
                    onClick={() => setTitularActivo(t)}
                    className="text-black hover:text-gray-600"
                    aria-label="Editar titular"
                  >
                    <IconEdit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {titularActivo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Titular</h2>
              <button onClick={() => setTitularActivo(null)}>
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                id="titular-name"
                name="nombre-titular"
                type="text"
                value={titularActivo.nombre}
                onChange={(e) =>
                  setTitularActivo({ ...titularActivo, nombre: e.target.value })
                }
                className="border rounded px-3 py-2 w-full"
                placeholder="Ingrese nombre"
              />
              <input
                id="titular-rut"
                name="rut-titular"
                type="text"
                value={titularActivo.rut}
                onChange={(e) => handleRutChange(e.target.value)}
                className={`border rounded px-3 py-2 w-full ${errorRut ? "border-red-500" : ""}`}
                placeholder="12.345.678-K"
                maxLength={12}
              />
              <p className="text-red-600 text-sm min-h-5">
                {errorRut || "\u00A0"}
              </p>

              <button
                onClick={handleGuardar}
                className="bg-black text-white py-2 rounded hover:bg-gray-800 w-full"
                disabled={!!errorRut}
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
