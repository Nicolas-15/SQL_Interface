"use client";

import { useState } from "react";
import {
  previewPagoTesoreriaAction,
  reversarPagoTesoreriaAction,
} from "@/app/lib/action/tesoreria/tesoreria.action";
import { toast } from "react-toastify";
import ConfirmationToast from "@/app/components/ConfirmationToast";
import {
  IconSearch,
  IconRotateClockwise,
  IconTable,
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconSearchOff,
} from "@tabler/icons-react";
import { formatRut, validarRut } from "@/app/lib/utils/validations";

export default function RegularizacionClient() {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [confirmedTesoreria, setConfirmedTesoreria] = useState(false);

  // Persistencia de búsqueda
  const [searchParams, setSearchParams] = useState({
    caja: "",
    folio: "",
    rut: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [rutError, setRutError] = useState("");

  // Selección de filas
  const [selectedItems, setSelectedItems] = useState<
    { orden: number; item: string }[]
  >([]);

  // Función auxiliar para refrescar la búsqueda con los parámetros actuales
  const refreshSearch = async () => {
    if (
      !searchParams.caja ||
      !searchParams.folio ||
      !searchParams.rut ||
      !searchParams.fecha
    )
      return;

    setLoading(true);
    setConfirmedTesoreria(false);
    setSelectedItems([]);

    const formData = new FormData();
    formData.append("caja", searchParams.caja);
    formData.append("folio", searchParams.folio);
    formData.append("rut", searchParams.rut);
    formData.append("fecha", searchParams.fecha);

    const result = await previewPagoTesoreriaAction(formData);
    if (result.error) {
      // Si no encuentra nada (ej. se borró todo), limpiamos la tabla
      if (result.error.includes("No se encontró")) {
        setPreviewData([]);
        toast.info("No quedan registros pendientes para este folio.");
      } else {
        toast.error(result.error);
      }
    } else {
      const data = result.data || [];
      setPreviewData(data);
      const allItems = data.map((d: any) => ({
        orden: d.Orden_Ingreso,
        item: d.Item_Pago,
      }));
      setSelectedItems(allItems);
    }
    setLoading(false);
  };

  const handleSearch = async (formData: FormData) => {
    setLoading(true);
    setPreviewData([]);
    setConfirmedTesoreria(false);
    setSelectedItems([]); // Resetear selección al buscar de nuevo

    // Guardar parámetros
    const params = {
      caja: formData.get("caja") as string,
      folio: formData.get("folio") as string,
      rut: formData.get("rut") as string,
      fecha: formData.get("fecha") as string,
    };
    setSearchParams(params);

    const result = await previewPagoTesoreriaAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      const data = result.data || [];
      setPreviewData(data);
      const allItems = data.map((d: any) => ({
        orden: d.Orden_Ingreso,
        item: d.Item_Pago,
      }));
      setSelectedItems(allItems);

      toast.success("Pagos encontrados");
    }
    setLoading(false);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        previewData.map((d: any) => ({
          orden: d.Orden_Ingreso,
          item: d.Item_Pago,
        })),
      );
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (orden: number, item: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, { orden, item }]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((i) => !(i.orden === orden && i.item === item)),
      );
    }
  };

  const isSelected = (orden: number, item: string) => {
    return selectedItems.some((i) => i.orden === orden && i.item === item);
  };

  return (
    <div className="space-y-8">
      {/* Instrucciones del Procedimiento */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-sm text-blue-900">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <IconInfoCircle className="w-5 h-5" />
          Procedimiento de Resolución
        </h3>
        <p className="mb-4">
          Este módulo apoya la regularización de pagos. Asegúrese de seleccionar
          solo los registros duplicados/erróneos.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-1">
              3.1. Pago No Registrado en Tesorería
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>El pago está en Deudores pero no en Tesorería.</li>
              <li>Confirme el reverso completo o parcial.</li>
              <li>
                <strong>Cajera/o:</strong> Reprocesa el pago con el{" "}
                <u>mismo folio</u>.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">
              3.2. Pago Registrado Parcialmente
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>
                <strong>Tesorería:</strong> Elimina pago en su sistema.
              </li>
              <li>
                <strong>Informática:</strong> Reversa registros en Deudores.
              </li>
              <li>
                <strong>Cajera/o:</strong> Reprocesa el pago.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario de Búsqueda */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
          <IconSearch className="text-blue-600 w-4 h-4" />
          Buscar Pago
        </h2>
        <form action={handleSearch} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">
                Número de Caja
              </label>
              <input
                name="caja"
                type="number"
                required
                min="1"
                defaultValue={searchParams.caja}
                className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">
                Folio de Caja
              </label>
              <input
                name="folio"
                type="number"
                required
                min="1"
                defaultValue={searchParams.folio}
                className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">
                RUT Contribuyente
              </label>
              <div className="relative">
                <input
                  name="rut"
                  type="text"
                  placeholder="12.345.678-9"
                  required
                  value={searchParams.rut}
                  onChange={(e) => {
                    const formatted = formatRut(e.target.value);
                    setSearchParams({ ...searchParams, rut: formatted });
                    if (formatted.length > 7) {
                      setRutError(validarRut(formatted) ? "" : "RUT inválido");
                    } else {
                      setRutError("");
                    }
                  }}
                  maxLength={12}
                  className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 outline-none transition-all ${
                    rutError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {searchParams.rut.length > 7 && !rutError && (
                  <IconCheck className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {rutError && (
                <p className="text-[10px] text-red-500 mt-0.5">{rutError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">
                Fecha Transacción
              </label>
              <input
                name="fecha"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                defaultValue={searchParams.fecha}
                className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      {previewData.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ring-1 ring-black/5">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <IconTable className="text-green-600 w-6 h-6" />
                Detalle del Pago ({previewData.length} registros encontrados)
              </h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {selectedItems.length} seleccionados para reverso
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        checked={
                          selectedItems.length === previewData.length &&
                          previewData.length > 0
                        }
                      />
                    </th>
                    {[
                      "Año",
                      "Área",
                      "Ingreso",
                      "Item",
                      "Emisión",
                      "Vencim.",
                      "RUT",
                      "Nombre",
                      "Placa",
                      "Patente",
                      "Propiedad",
                      "Emitido",
                      "Fecha Pago",
                      "Caja",
                      "N° Ingreso",
                      "Rol",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => {
                    const selected = isSelected(
                      row.Orden_Ingreso,
                      row.Item_Pago,
                    );
                    return (
                      <tr
                        key={`${row.Orden_Ingreso}-${row.Item_Pago}`}
                        className={`transition-all duration-200 ${selected ? "bg-blue-50/80" : "hover:bg-blue-50/30 hover:scale-[1.001] group"}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            checked={selected}
                            onChange={(e) =>
                              toggleSelectItem(
                                row.Orden_Ingreso,
                                row.Item_Pago,
                                e.target.checked,
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Ano_Proceso}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Codigo_Area}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Orden_Ingreso}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                          {row.Item_Pago}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {row.Fecha_Emision
                            ? new Date(row.Fecha_Emision).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {row.Fecha_Vencimiento
                            ? new Date(
                                row.Fecha_Vencimiento,
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Rut}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap max-w-xs truncate"
                          title={row.Nombre}
                        >
                          {row.Nombre}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Placa_Vehiculo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Rol_Patente}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Rol_Propiedad}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.EmitidoPor}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-green-600">
                          {row.Fecha_Pago
                            ? new Date(row.Fecha_Pago).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Numero_Caja}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Numero_Ingreso}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.Rol}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer con acciones */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <label className="flex items-start gap-3 cursor-pointer bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-colors max-w-lg">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                  checked={confirmedTesoreria}
                  onChange={(e) => setConfirmedTesoreria(e.target.checked)}
                />
                <div className="text-sm">
                  <span className="font-semibold text-gray-800 block">
                    Confirmar Coordinación con Tesorería
                  </span>
                  <span className="text-gray-500 text-xs block">
                    Declaro que he verificado que este registro ya fue eliminado
                    o gestionado en el sistema de Tesorería.
                  </span>
                </div>
              </label>

              <form
                action={async (formData) => {
                  if (!confirmedTesoreria) {
                    toast.warning(
                      "Debe confirmar la coordinación con Tesorería antes de continuar.",
                    );
                    return;
                  }

                  if (selectedItems.length === 0) {
                    toast.warning(
                      "Debe seleccionar al menos un registro para reversar.",
                    );
                    return;
                  }

                  toast(({ closeToast }) => (
                    <ConfirmationToast
                      message={`¿Estás seguro de reversar estos ${selectedItems.length} registros seleccionados? Esta acción no se puede deshacer.`}
                      onConfirm={async () => {
                        const result =
                          await reversarPagoTesoreriaAction(formData);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          toast.success(
                            "Pago reversado parcial/totalmente correctamente",
                          );
                          // Refrescar en lugar de limpiar
                          await refreshSearch();
                        }
                      }}
                      closeToast={closeToast}
                    />
                  ));
                }}
              >
                <input
                  type="hidden"
                  name="caja"
                  value={previewData[0]?.Numero_Caja}
                />
                <input
                  type="hidden"
                  name="folio"
                  value={previewData[0]?.Numero_Ingreso}
                />
                <input type="hidden" name="rut" value={previewData[0]?.Rut} />
                <input
                  type="hidden"
                  name="fecha"
                  value={
                    previewData[0]?.Fecha_Pago
                      ? new Date(previewData[0].Fecha_Pago)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                />
                {/* Input escondido con la selección */}
                <input
                  type="hidden"
                  name="selectedItems"
                  value={JSON.stringify(selectedItems)}
                />

                <button
                  type="submit"
                  disabled={!confirmedTesoreria || selectedItems.length === 0}
                  className={`
                    px-6 py-2 rounded-lg transition flex items-center gap-2 font-medium border
                    ${
                      confirmedTesoreria && selectedItems.length > 0
                        ? "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                    }
                  `}
                >
                  <IconRotateClockwise className="w-5 h-5" />
                  Confirmar Reverso ({selectedItems.length} seleccionados)
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        !loading && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner mb-4">
              <IconSearchOff className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Sin resultados para mostrar
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Utiliza el formulario superior para buscar pagos por Caja, Folio,
              RUT y Fecha.
            </p>
          </div>
        )
      )}
    </div>
  );
}
