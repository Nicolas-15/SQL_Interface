"use client";

import { useState, Fragment, useEffect } from "react";
import { toast } from "react-toastify";
import ConfirmationToast from "@/app/components/ConfirmationToast";
import {
  buscarDecretosAction,
  liberarDecretoAction,
  regularizarDecretoAction,
  obtenerHistorialAction,
  buscarDecretosLiberadosAction,
} from "@/app/lib/action/regularizar.action";
import { IconReceipt } from "@tabler/icons-react";

// Tipos
interface DecretoBD {
  Codigo_Area: number;
  Ano_Proceso: number;
  NumeroDecreto: number;
  Fecha: string;
  Rut: string;
  Nombre: string;
  Monto: number;
  FechaDePago: string;
  Glosa: string;
  SDF: string;
}

interface DecretoHistorico {
  Id: number;
  Codigo_Estado: number;
  Fecha_Estado: string;
  Id_Responsable: string;
  Observacion: string;
}

export default function RegularizarFolioPage() {
  // Estado del Formulario
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [numero, setNumero] = useState("");

  // Estado de Datos
  const [decretos, setDecretos] = useState<DecretoBD[]>([]);
  const [decretosLiberados, setDecretosLiberados] = useState<DecretoBD[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de la pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // Efecto: Cargar liberados al cambiar año o página
  useEffect(() => {
    if (anio) cargarDecretosLiberados(currentPage);
  }, [anio, currentPage]);

  const cargarDecretosLiberados = async (page = 1) => {
    try {
      const res = await buscarDecretosLiberadosAction(Number(anio), page);
      if (res.success && res.decretos) {
        setDecretosLiberados(res.decretos as unknown as DecretoBD[]);
        setTotalRecords(res.total || 0);

        // Scroll eliminado para evitar saltos bruscos
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Estado del Historial (para el decreto seleccionado)
  const [mostrarHistorial, setMostrarHistorial] = useState<number | null>(null); // NumeroDecreto
  const [historial, setHistorial] = useState<DecretoHistorico[]>([]);

  //  BUSCAR
  const handleBuscar = async () => {
    if (!anio || !numero) {
      toast.warning("Debe ingresar Año y Numero de decreto para buscar.");
      return;
    }

    setLoading(true);
    setDecretos([]);
    setMostrarHistorial(null);

    try {
      const res = await buscarDecretosAction(Number(anio), Number(numero));
      if (res.success && res.decretos) {
        setDecretos(res.decretos as unknown as DecretoBD[]);
        if (res.decretos.length === 0) {
          toast.info("No se encontró el decreto.");
        } else {
          toast.success("Decreto encontrado.");
        }
      } else {
        toast.error(res.error || "Error al buscar.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al buscar.");
    } finally {
      setLoading(false);
    }
  };

  //  VER HISTORIAL
  const handleVerHistorial = async (d: DecretoBD) => {
    if (mostrarHistorial === d.NumeroDecreto) {
      setMostrarHistorial(null); // Ocultar si ya está visible
      return;
    }

    try {
      const res = await obtenerHistorialAction(d.Ano_Proceso, d.NumeroDecreto);
      if (res.success && res.historial) {
        setHistorial(res.historial as unknown as DecretoHistorico[]);
        setMostrarHistorial(d.NumeroDecreto);
      } else {
        toast.warning("No se pudo obtener el historial.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar historial.");
    }
  };

  // LIBERAR (Paso 1)
  const handleLiberar = async (d: DecretoBD) => {
    if (String(d.SDF) === "false") {
      toast.warning("El decreto ya está liberado.");
      return;
    }

    toast(
      ({ closeToast }) => (
        <ConfirmationToast
          message={`¿Desea LIBERAR el decreto N° ${d.NumeroDecreto}?`}
          onConfirm={async () => {
            try {
              const res = await liberarDecretoAction(
                d.Ano_Proceso,
                d.NumeroDecreto,
              );
              if (res.success) {
                toast.success("Decreto liberado exitosamente.");
                // Actualizar tabla localmente
                setDecretos((prev) =>
                  prev.map((item) =>
                    item.NumeroDecreto === d.NumeroDecreto
                      ? { ...item, SDF: "false" }
                      : item,
                  ),
                );
                cargarDecretosLiberados();
              } else {
                toast.error("No se pudo liberar el decreto.");
              }
            } catch (e) {
              console.error(e);
              toast.error("Error al liberar.");
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
  };

  // REGULARIZAR (Paso 2)
  const handleRegularizar = async (d: DecretoBD) => {
    if (String(d.SDF) !== "false") {
      toast.warning("El decreto NO está liberado.");
      return;
    }

    toast(
      ({ closeToast }) => (
        <ConfirmationToast
          message={`¿Desea REGULARIZAR (Restaurar) el decreto N° ${d.NumeroDecreto}?`}
          onConfirm={async () => {
            try {
              const res = await regularizarDecretoAction(
                d.Ano_Proceso,
                d.NumeroDecreto,
              );
              if (res.success) {
                toast.success("Decreto regularizado exitosamente.");
                // Actualizar tabla localmente (asumimos que vuelve a estado original, quitamos 'false')
                setDecretos((prev) =>
                  prev.map((item) =>
                    item.NumeroDecreto === d.NumeroDecreto
                      ? { ...item, SDF: "NO LIBERADO" }
                      : item,
                  ),
                );
                cargarDecretosLiberados();
              } else {
                toast.error("No se pudo regularizar el decreto.");
              }
            } catch (e) {
              console.error(e);
              toast.error("Error al regularizar.");
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
  };

  return (
    <div className="mx-auto py-10">
      {/* HEADER ESTILIZADO */}
      <div className="text-center mb-10">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
          <IconReceipt className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
          Regularización de Folio
        </h2>
        <p className="mt-2 text-md text-slate-600">
          Gestión y regularización de decretos municipales
        </p>
      </div>

      {/* FORMULARIO DE BÚSQUEDA */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año Proceso
            </label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Ej: 2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número Decreto
            </label>
            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Ej: 4"
            />
          </div>
          <button
            onClick={handleBuscar}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      {decretos.length > 0 && (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  Decreto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[350px]">
                  Beneficiario
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                  Monto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                  Estado (SDF)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {decretos.map((d) => {
                const sdfValue = String(d.SDF);
                const isReleased = sdfValue === "false";
                return (
                  <Fragment
                    key={`${d.Codigo_Area}-${d.Ano_Proceso}-${d.NumeroDecreto}`}
                  >
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="font-bold text-gray-900">
                          {d.NumeroDecreto}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(d.Fecha).toLocaleDateString("es-CL", {
                          timeZone: "UTC",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-normal w-[350px]">
                        <div className="text-sm font-medium text-gray-900 truncate w-[350px]">
                          {d.Nombre}
                        </div>
                        <div className="text-sm text-gray-500">{d.Rut}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900">
                        {d.Monto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isReleased
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isReleased ? "LIBERADO" : "NO LIBERADO"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleVerHistorial(d)}
                          className="text-indigo-600 hover:text-indigo-900 underline"
                        >
                          Historial
                        </button>
                        {!isReleased ? (
                          <button
                            onClick={() => handleLiberar(d)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Liberar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegularizar(d)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Regularizar
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* HISTORIAL EXPANDIDO */}
                    {mostrarHistorial === d.NumeroDecreto && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <h4 className="font-bold text-sm mb-2 text-gray-700">
                            Historial Decreto {d.NumeroDecreto}
                          </h4>
                          {historial.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              No hay registros.
                            </p>
                          ) : (
                            <table className="min-w-full border rounded bg-white">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-xs border">
                                    ID
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Estado
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Fecha
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Responsable
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Observación
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {historial.map((h) => (
                                  <tr key={h.Id}>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Id}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Codigo_Estado}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {new Date(h.Fecha_Estado).toLocaleString(
                                        "es-CL",
                                        {
                                          timeZone: "UTC",
                                        },
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Id_Responsable}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Observacion}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLA DE DECRETOS LIBERADOS (PENDIENTES) */}
      <div className="mt-12 mb-12">
        <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2 text-center">
          Decretos Pendientes de Regularizar (Liberados)
        </h2>
        {decretosLiberados.length === 0 ? (
          <p className="text-gray-500 italic">
            No hay decretos liberados pendientes para este año.
          </p>
        ) : (
          <div
            id="tabla-pendientes"
            className="bg-white shadow-md rounded-xl overflow-hidden min-h-[1150px]"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider w-[100px]">
                    Decreto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider w-[120px]">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider w-[350px]">
                    Beneficiario
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-orange-800 uppercase tracking-wider w-[150px]">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-orange-800 uppercase tracking-wider w-[150px]">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-orange-800 uppercase tracking-wider w-[200px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {decretosLiberados.map((d) => (
                  <Fragment
                    key={`lib-${d.Codigo_Area}-${d.Ano_Proceso}-${d.NumeroDecreto}`}
                  >
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap h-[110px]">
                        <div className="font-bold text-gray-900">
                          {d.NumeroDecreto}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(d.Fecha).toLocaleDateString("es-CL", {
                          timeZone: "UTC",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-normal w-[350px]">
                        <div className="text-sm font-medium text-gray-900 truncate w-[350px]">
                          {d.Nombre}
                        </div>
                        <div className="text-sm text-gray-500">{d.Rut}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900">
                        {d.Monto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          LIBERADO
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleVerHistorial(d)}
                          className="text-indigo-600 hover:text-indigo-900 underline"
                        >
                          Historial
                        </button>
                        <button
                          onClick={() => handleRegularizar(d)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Regularizar
                        </button>
                      </td>
                    </tr>
                    {/* HISTORIAL EXPANDIDO REUTILIZADO */}
                    {mostrarHistorial === d.NumeroDecreto && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <h4 className="font-bold text-sm mb-2 text-gray-700">
                            Historial Decreto {d.NumeroDecreto}
                          </h4>
                          {historial.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              No hay registros.
                            </p>
                          ) : (
                            <table className="min-w-full border rounded bg-white">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-xs border">
                                    ID
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Estado
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Fecha
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Responsable
                                  </th>
                                  <th className="px-4 py-2 text-xs border">
                                    Observación
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {historial.map((h) => (
                                  <tr key={h.Id}>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Id}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Codigo_Estado}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {new Date(h.Fecha_Estado).toLocaleString(
                                        "es-CL",
                                        {
                                          timeZone: "UTC",
                                        },
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Id_Responsable}
                                    </td>
                                    <td className="px-4 py-2 text-xs border">
                                      {h.Observacion}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS AVANZADOS */}
        {totalRecords > pageSize && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            {/* Primero */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
              title="Ir al inicio"
            >
              &laquo;
            </button>
            {/* Anterior */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Anterior
            </button>

            {/* Ventana de Páginas */}
            {(() => {
              const totalPages = Math.ceil(totalRecords / pageSize);
              const maxVisible = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisible / 2),
              );
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              const pages = [];
              if (startPage > 1) {
                pages.push(
                  <span key="start-ellipsis" className="px-2 text-gray-400">
                    ...
                  </span>,
                );
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-2 rounded font-medium transition ${
                      currentPage === i
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {i}
                  </button>,
                );
              }

              if (endPage < totalPages) {
                pages.push(
                  <span key="end-ellipsis" className="px-2 text-gray-400">
                    ...
                  </span>,
                );
              }

              return pages;
            })()}

            {/* Siguiente */}
            <button
              onClick={() =>
                setCurrentPage((p) => (p * pageSize < totalRecords ? p + 1 : p))
              }
              disabled={currentPage * pageSize >= totalRecords}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Siguiente
            </button>
            {/* Último */}
            <button
              onClick={() => setCurrentPage(Math.ceil(totalRecords / pageSize))}
              disabled={currentPage * pageSize >= totalRecords}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
              title="Ir al final"
            >
              &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
