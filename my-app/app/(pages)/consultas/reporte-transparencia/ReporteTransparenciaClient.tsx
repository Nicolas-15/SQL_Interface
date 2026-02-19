"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  obtenerReporteTransparenciaAction,
  obtenerRangoFechasAction,
} from "@/app/lib/action/reporte.action";
import ExcelJS from "exceljs";
import { IconFileDescription } from "@tabler/icons-react";

type Reporte = {
  Comuna: string;
  Placa: string;
  Digito: string;
  Correlativo_Caja: number;
  numero_boletin: number;
  Forma_de_Pago: string;
  Papel_o_Electronico: string;
  Codigo_SII: string;
  Año_Fabricacion: number;
  Tasacion: number;
  Numero_Factura: string;
  Neto_Factura: number;
  Rut: string;
  Contribuyente: string;
  Direccion: string;
  Telefono: string;
  Telefono_Movil: string;
  Mail: string;
  Comuna_Propietario: string;
  Municipalidad: string;
  Comuna_Anterior: string;
  Codigo_Comuna_Ant: number;
  Fecha_Pago: string;
  Fecha_Vencimiento: string;
  Total_a_Pagar: number;
  Valor_IPC: number;
  Valor_Multa: number;
  Valor_Contado: number;
  Año_del_Permiso: number;
  Descripcion: string;
  Marca: string;
  Modelo: string;
  Cilindrada: string;
  Combustible: string;
  Transmision: string;
  Equipamiento: string;
  Color: string;
  Numero_Asientos: number;
  Numero_Chasis: string;
  Numero_Chassis: string;
  Numero_Motor: string;
};

const columnasDisponibles: (keyof Reporte)[] = [
  "Comuna",
  "Placa",
  "Digito",
  "Correlativo_Caja",
  "numero_boletin",
  "Forma_de_Pago",
  "Papel_o_Electronico",
  "Codigo_SII",
  "Año_Fabricacion",
  "Tasacion",
  "Numero_Factura",
  "Neto_Factura",
  "Rut",
  "Contribuyente",
  "Direccion",
  "Telefono",
  "Telefono_Movil",
  "Mail",
  "Comuna_Propietario",
  "Municipalidad",
  "Comuna_Anterior",
  "Codigo_Comuna_Ant",
  "Fecha_Pago",
  "Fecha_Vencimiento",
  "Total_a_Pagar",
  "Valor_IPC",
  "Valor_Multa",
  "Valor_Contado",
  "Año_del_Permiso",
  "Descripcion",
  "Marca",
  "Modelo",
  "Cilindrada",
  "Combustible",
  "Transmision",
  "Equipamiento",
  "Color",
  "Numero_Asientos",
  "Numero_Chasis",
  "Numero_Chassis",
  "Numero_Motor",
];

const columnasPorDefecto: (keyof Reporte)[] = [
  "Comuna",
  "Placa",
  "Digito",
  "Forma_de_Pago",
  "Codigo_SII",
  "Comuna_Anterior",
  "Codigo_Comuna_Ant",
  "Fecha_Pago",
  "Total_a_Pagar",
];

export default function ReporteTransparenciaClient() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comuna, setComuna] = useState("El Quisco");

  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [columnasSeleccionadas, setColumnasSeleccionadas] =
    useState<(keyof Reporte)[]>(columnasPorDefecto);
  const [hasSearched, setHasSearched] = useState(false);
  const [rangoDisponible, setRangoDisponible] = useState<{
    min: string | null;
    max: string | null;
  }>({ min: null, max: null });

  useEffect(() => {
    obtenerRangoFechasAction().then((res) => {
      if (res.success && res.data) {
        setRangoDisponible({
          min: res.data.MinFecha,
          max: res.data.MaxFecha,
        });
      }
    });
  }, []);

  const setRangoRapido = (tipo: "este_año" | "año_pasado" | "ultimo_mes") => {
    const hoy = new Date();
    let inicio = "";
    let fin = "";

    if (tipo === "este_año") {
      inicio = `${hoy.getFullYear()}-01-01`;
      fin = hoy.toISOString().split("T")[0];
    } else if (tipo === "año_pasado") {
      inicio = `${hoy.getFullYear() - 1}-01-01`;
      fin = `${hoy.getFullYear() - 1}-12-31`;
    } else if (tipo === "ultimo_mes") {
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      inicio = primerDiaMes.toISOString().split("T")[0];
      fin = hoy.toISOString().split("T")[0];
    }

    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.warning("Debe ingresar fecha inicio y fecha fin");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await obtenerReporteTransparenciaAction(
        fechaInicio,
        fechaFin,
      );
      if (res.success && res.reportes) {
        setReportes(res.reportes as Reporte[]);
        toast.success(`Reporte generado con ${res.reportes.length} registros.`);
      } else {
        toast.error("No se pudieron obtener los datos.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al generar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  const toggleColumna = (col: keyof Reporte) => {
    setColumnasSeleccionadas((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const exportarExcel = () => {
    if (reportes.length === 0) {
      toast.warning("No hay datos para exportar.");
      return;
    }

    setExporting(true);

    setTimeout(async () => {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte");

        // Definir columnas
        worksheet.columns = columnasSeleccionadas.map((col) => {
          let header = col.replace(/_/g, " ");
          if (col === "Total_a_Pagar") header = "Total Pagado";

          return {
            header,
            key: col,
            width: 20,
          };
        });

        // Agregar filas
        worksheet.addRows(reportes);

        // Estilo Encabezado
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // Texto blanco
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2563EB" },
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };
        headerRow.height = 24;

        // Aplicar filtros automáticos
        worksheet.autoFilter = {
          from: {
            row: 1,
            column: 1,
          },
          to: {
            row: 1,
            column: columnasSeleccionadas.length,
          },
        };

        // Formato de celdas (Moneda, Bordes, Alineación)
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            // Bordes para todas las celdas
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };

            if (rowNumber > 1) {
              // Filas de datos
              const colKey = columnasSeleccionadas[colNumber - 1] as string;
              const isMoney = [
                "Tasacion",
                "Neto_Factura",
                "Total_a_Pagar",
                "Valor_IPC",
                "Valor_Multa",
                "Valor_Contado",
              ].includes(colKey);

              if (
                isMoney &&
                (typeof cell.value === "number" || !isNaN(Number(cell.value)))
              ) {
                cell.numFmt = '"$"#,##0';
                cell.alignment = { horizontal: "right" };
              }

              // Ajustar formato de fechas si es necesario (Exceljs a veces requiere Date object)
              // Si el valor es string ISO, intentar convertirlo para que Excel lo reconozca como fecha
              if (
                typeof cell.value === "string" &&
                /^\d{4}-\d{2}-\d{2}/.test(cell.value)
              ) {
                // Dejar como string o convertir a Date? String formateado suele ser suficiente si no se requiere cálculo
              }
            }
          });
        });

        // Generar archivo y descargar
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reporte_transparencia_${fechaInicio}_${fechaFin}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Excel generado exitosamente");
      } catch (error) {
        console.error("Error al generar Excel:", error);
        toast.error("Error al generar el archivo Excel");
      } finally {
        setExporting(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen py-6 max-w-[95%] mx-auto">
      {/* titulo pagina */}
      <div className="text-center mb-10">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
          <IconFileDescription className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
          Reporte de Permisos de Circulación
        </h2>
        <p className="mt-2 text-md text-slate-600">
          Generación y exportación de información municipal (Permisos de
          Circulación)
        </p>
      </div>

      {/* Cards con filtros*/}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-8 w-full">
        <div className="flex justify-between w-full gap-4">
          <div className="w-1/3 ">
            <label className="block text-sm font-medium text-gray-700 mb-1 ">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
            {rangoDisponible.min && rangoDisponible.max && (
              <span className="text-md text-blue-600 block mt-1">
                Datos desde: {rangoDisponible.min} hasta {rangoDisponible.max}
              </span>
            )}
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comuna
            </label>
            <input
              type="text"
              value={comuna}
              disabled
              className="border rounded-lg px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setRangoRapido("este_año")}
              className="text-md bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Este Año
            </button>
            <button
              onClick={() => setRangoRapido("año_pasado")}
              className="text-md bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Año Pasado
            </button>
            <button
              onClick={() => setRangoRapido("ultimo_mes")}
              className="text-md bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Este Mes
            </button>
          </div>
          <div className="flex justify-self-end">
            <button
              onClick={generarReporte}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Generando...</span>
                </>
              ) : (
                "Generar Reporte"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje Sin Resultados */}
      {hasSearched && reportes.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center mt-8">
          <div className="text-gray-400 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No se encontraron resultados
          </h3>
          <p className="text-gray-500">
            Intenta con un rango de fechas diferente.
          </p>
        </div>
      )}

      {/* Seleccionar las columnas*/}
      {reportes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">
            Seleccionar columnas a exportar
          </h2>
          <div className="flex flex-wrap gap-4 max-h-auto overflow-y-auto">
            {columnasDisponibles.map((col) => (
              <label
                key={col}
                className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1 rounded-full border"
              >
                <input
                  type="checkbox"
                  checked={columnasSeleccionadas.includes(col)}
                  onChange={() => toggleColumna(col)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                {col}
              </label>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={exportarExcel}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {exporting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Exportar a Excel</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tabla - Vista previa limitada */}
      {reportes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col max-h-[600px]">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0 rounded-t-2xl">
            <h3 className="font-semibold text-gray-700">
              Vista Previa ({reportes.length} registros)
            </h3>
            <span className="text-xs text-gray-500">
              Mostrando 50 primeros registros
            </span>
          </div>
          <div className="overflow-auto flex-1 w-full">
            <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  {columnasSeleccionadas.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap bg-gray-100 border-b min-w-[150px]"
                    >
                      {col === "Total_a_Pagar"
                        ? "Total Pagado"
                        : col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reportes.slice(0, 50).map((r, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors">
                    {columnasSeleccionadas.map((col) => {
                      const val = r[col];
                      const isMoney = [
                        "Tasacion",
                        "Neto_Factura",
                        "Total_a_Pagar",
                        "Valor_IPC",
                        "Valor_Multa",
                        "Valor_Contado",
                      ].includes(col as string);

                      const formatValue = (value: any) => {
                        if (value === null || value === undefined) return "";
                        if (isMoney && typeof value === "number") {
                          return new Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }).format(value);
                        }
                        // Detectar fechas (string ISO o timestamp)
                        if (
                          typeof value === "string" &&
                          /^\d{4}-\d{2}-\d{2}T/.test(value)
                        ) {
                          const date = new Date(value);
                          if (!isNaN(date.getTime())) {
                            return date
                              .toISOString()
                              .replace("T", " ")
                              .replace("Z", "");
                          }
                        }
                        return value;
                      };

                      return (
                        <td
                          key={`${i}-${col}`}
                          className={`px-4 py-2 whitespace-nowrap text-gray-700 truncate max-w-[200px] ${
                            isMoney ? "text-right font-mono" : ""
                          }`}
                          title={String(val)}
                        >
                          {formatValue(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reportes.length > 50 && (
            <div className="p-4 text-center text-gray-500 border-t shrink-0 bg-gray-50 rounded-b-2xl">
              ... y {reportes.length - 50} registros más. Exporta para ver todo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
