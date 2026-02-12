"use client";

import { toast } from "react-toastify";
import { useState, useMemo } from "react";

interface DecretoProceso {
  area: string;
  anio: string;
  numero: string;
  fecha: string;
  estado: string;
}

interface DecretoBD {
  area: string;
  estado: string;
  fecha: string;
  monto: number;
  beneficiario: string;
}

export default function RegularizacionDecretoPage() {
  const anioActual = new Date().getFullYear();

  const [anio, setAnio] = useState("");
  const [numero, setNumero] = useState("");
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [decretoEncontrado, setDecretoEncontrado] = useState<DecretoBD | null>(
    null,
  );
  const [auditoria, setAuditoria] = useState<DecretoProceso[]>([]);

  // 🔎 VALIDACIONES MEMOIZADAS
  const errores = useMemo(() => {
    return {
      anioVacio: anio === "",
      anioRango:
        anio !== "" && (Number(anio) < 2009 || Number(anio) > anioActual + 1),

      numeroVacio: numero === "",
      numeroInvalido: numero !== "" && Number(numero) <= 0,
    };
  }, [anio, numero, anioActual]);

  const formularioBusquedaValido = useMemo(() => {
    return (
      !errores.anioVacio &&
      !errores.anioRango &&
      !errores.numeroVacio &&
      !errores.numeroInvalido
    );
  }, [errores]);

  // 🔁 Helper reutilizable
  const esMismoDecreto = (d: DecretoProceso) =>
    d.anio === anio && d.numero === numero;

  const estaLiberado = auditoria.some(
    (d) => d.anio === anio && d.numero === numero,
  );

  // 🔍 BUSCAR
  const buscarDecreto = async () => {
    if (!formularioBusquedaValido) return;

    try {
      setLoadingBusqueda(true);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const respuestaFake: DecretoBD = {
        area: "Educación",
        estado: "Pagado",
        fecha: "15-01-2026",
        monto: 1250000,
        beneficiario: "Constructora ABC Ltda.",
      };

      setDecretoEncontrado(respuestaFake);
      toast.success("Decreto encontrado correctamente.");
    } catch {
      toast.error("Error al buscar decreto.");
    } finally {
      setLoadingBusqueda(false);
    }
  };

  // ✅ PASO 1
  const ejecutarPaso1 = () => {
    if (!decretoEncontrado) {
      toast.warning("Debe buscar un decreto primero.");
      return;
    }

    if (auditoria.some(esMismoDecreto)) {
      toast.warning("Este decreto ya se encuentra liberado.");
      return;
    }

    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 font-semibold">
            ¿Confirmar liberación del decreto?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const nuevoRegistro: DecretoProceso = {
                  area: decretoEncontrado.area,
                  anio,
                  numero,
                  fecha: new Date().toLocaleString(),
                  estado: "Liberado (Pendiente Regularizar)",
                };

                setAuditoria((prev) => [...prev, nuevoRegistro]);
                toast.success("Decreto liberado correctamente.");
                closeToast?.();
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Confirmar
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { autoClose: false, position: "top-center" },
    );
  };

  // ✅ PASO 2
  const ejecutarPaso2 = () => {
    if (!decretoEncontrado) {
      toast.warning("Debe buscar un decreto primero.");
      return;
    }

    if (!estaLiberado) {
      toast.error("Este decreto no se encuentra pendiente.");
      return;
    }

    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 font-semibold">
            ¿Confirmar regularización del decreto?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAuditoria((prev) => prev.filter((d) => !esMismoDecreto(d)));

                // 🔄 Limpieza visual después de regularizar
                setDecretoEncontrado(null);
                setAnio("");
                setNumero("");

                toast.success("Decreto regularizado correctamente.", {
                  position: "bottom-right",
                });
                closeToast?.();
              }}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Confirmar
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { autoClose: false, position: "top-center" },
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Regularización de Decreto de Pago
      </h1>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-5 mb-10">
        {/* AÑO */}
        <div>
          <label className="block font-medium mb-1">Año de Proceso</label>

          <input
            type="number"
            value={anio}
            min={2009}
            max={anioActual + 1}
            onChange={(e) => {
              setAnio(e.target.value);
              setNumero("");
              setDecretoEncontrado(null);
            }}
            className={`border rounded-lg px-4 py-2 w-full transition ${
              errores.anioVacio || errores.anioRango
                ? "border-red-500 bg-red-50"
                : "bg-gray-50"
            }`}
          />

          {errores.anioVacio && (
            <p className="text-red-600 text-sm mt-1">
              Debe ingresar el año de proceso.
            </p>
          )}

          {errores.anioRango && (
            <p className="text-red-600 text-sm mt-1">
              El año debe estar entre 2009 y {anioActual + 1}.
            </p>
          )}
        </div>

        {/* NÚMERO */}
        <div>
          <label className="block font-medium mb-1">Número de Decreto</label>

          <input
            type="number"
            value={numero}
            min={1}
            onChange={(e) => setNumero(e.target.value)}
            className={`border rounded-lg px-4 py-2 w-full transition ${
              errores.numeroVacio || errores.numeroInvalido
                ? "border-red-500 bg-red-50"
                : "bg-gray-50"
            }`}
          />

          {errores.numeroVacio && (
            <p className="text-red-600 text-sm mt-1">
              Debe ingresar el número de decreto.
            </p>
          )}

          {errores.numeroInvalido && (
            <p className="text-red-600 text-sm mt-1">
              El número debe ser mayor a 0.
            </p>
          )}

          <p className="text-gray-500 text-xs mt-1">
            El número comienza en 1 cada año.
          </p>
        </div>

        <button
          onClick={buscarDecreto}
          disabled={!formularioBusquedaValido || loadingBusqueda}
          className={`w-full py-2 rounded-lg text-white font-semibold ${
            formularioBusquedaValido
              ? "bg-gray-800 hover:bg-black"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loadingBusqueda ? "Buscando..." : "Buscar Decreto"}
        </button>

        {decretoEncontrado && (
          <div className="bg-gray-100 p-6 rounded-xl mt-4 border">
            <h3 className="text-lg font-semibold mb-4">
              Información del Decreto
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Año:</strong> {anio}
              </p>
              <p>
                <strong>N° Decreto:</strong> {numero}
              </p>
              <p>
                <strong>Área:</strong> {decretoEncontrado.area}
              </p>
              <p>
                <strong>Estado:</strong> {decretoEncontrado.estado}
              </p>
              <p>
                <strong>Fecha:</strong> {decretoEncontrado.fecha}
              </p>
              <p>
                <strong>Monto:</strong> $
                {decretoEncontrado.monto.toLocaleString()}
              </p>
              <p className="col-span-2">
                <strong>Beneficiario:</strong> {decretoEncontrado.beneficiario}
              </p>
            </div>
          </div>
        )}

        {decretoEncontrado && (
          <div className="flex gap-4 pt-4">
            <button
              onClick={ejecutarPaso1}
              className="w-full py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Paso 1 – Liberar Decreto
            </button>

            <button
              onClick={ejecutarPaso2}
              disabled={!estaLiberado}
              className={`w-full py-2 rounded-lg text-white font-semibold ${
                estaLiberado
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Paso 2 – Regularizar Estado
            </button>
          </div>
        )}
      </div>

      {/* TABLA */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Decretos Pendientes de Regularización
        </h2>

        {auditoria.length === 0 ? (
          <p className="text-gray-500">No existen decretos pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Área</th>
                  <th className="border px-4 py-2">Año</th>
                  <th className="border px-4 py-2">N° Decreto</th>
                  <th className="border px-4 py-2">Fecha</th>
                  <th className="border px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {auditoria.map((d) => (
                  <tr key={`${d.anio}-${d.numero}`} className="text-center">
                    <td className="border px-4 py-2">{d.area}</td>
                    <td className="border px-4 py-2">{d.anio}</td>
                    <td className="border px-4 py-2">{d.numero}</td>
                    <td className="border px-4 py-2">{d.fecha}</td>
                    <td className="border px-4 py-2">
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {d.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
