"use client";

import { useState } from "react";
import {
  previewPagoTesoreriaAction,
  reversarPagoTesoreriaAction,
  deshacerUltimoReversoAction,
  obtenerUltimoReversoAction,
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
  IconLifebuoy,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
} from "@tabler/icons-react";
import { formatRut, validarRut } from "@/app/lib/utils/validations";

export default function RegularizacionClient() {
  const [loading, setLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
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

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyItems, setEmergencyItems] = useState<any[]>([]);
  const [selectedEmergencyItems, setSelectedEmergencyItems] = useState<
    { OI: number; IP: string; NC: number; NI: number }[]
  >([]);

  // Paginación modal emergencia
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filtros modal emergencia
  const [emergencySearchText, setEmergencySearchText] = useState("");
  const [emergencySearchDate, setEmergencySearchDate] = useState("");

  const filteredEmergencyItems = emergencyItems.filter((item) => {
    const searchTextLower = emergencySearchText.toLowerCase();
    const textMatch =
      !emergencySearchText ||
      String(item.OI ?? item.Orden_Ingreso)
        .toLowerCase()
        .includes(searchTextLower) ||
      String(item.IP ?? item.Item_Pago)
        .toLowerCase()
        .includes(searchTextLower) ||
      String(item.NC ?? item.Numero_Caja)
        .toLowerCase()
        .includes(searchTextLower) ||
      String(item.NI ?? item.Numero_Ingreso)
        .toLowerCase()
        .includes(searchTextLower) ||
      String(item.R ?? item.Rut)
        .toLowerCase()
        .includes(searchTextLower);

    // Si FP (Fecha_Pago / Fecha Transacción) coincide o la fecha original de la auditoria de reversa coincide
    const itemDate = item.FP
      ? new Date(item.FP).toISOString().split("T")[0]
      : "";
    const dateMatch =
      !emergencySearchDate ||
      itemDate === emergencySearchDate ||
      item.HoraReverso?.includes(emergencySearchDate);

    return textMatch && dateMatch;
  });

  const handleOpenEmergency = async () => {
    setIsRestoring(true);
    const result = await obtenerUltimoReversoAction();
    setIsRestoring(false);

    if (result.error || !result.data || result.data.length === 0) {
      toast.error(
        result.error ||
          "No se encontraron reversos durante este día para deshacer.",
      );
      return;
    }

    setEmergencyItems(result.data);
    setSelectedEmergencyItems(
      result.data.map((d: any) => ({
        OI: d.OI ?? d.Orden_Ingreso,
        IP: d.IP ?? d.Item_Pago,
        NC: d.NC ?? d.Numero_Caja,
        NI: d.NI ?? d.Numero_Ingreso,
      })),
    );
    setCurrentPage(1);
    setEmergencySearchText("");
    setEmergencySearchDate("");
    setShowEmergencyModal(true);
  };

  const toggleSelectEmergencyAll = (checked: boolean) => {
    if (checked) {
      const paginatedItems = filteredEmergencyItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );
      const newGrip = paginatedItems.map((d: any) => ({
        OI: d.OI ?? d.Orden_Ingreso,
        IP: d.IP ?? d.Item_Pago,
        NC: d.NC ?? d.Numero_Caja,
        NI: d.NI ?? d.Numero_Ingreso,
      }));
      const existingFilter = selectedEmergencyItems.filter(
        (s) =>
          !newGrip.some(
            (n) =>
              n.OI === s.OI && n.IP === s.IP && n.NC === s.NC && n.NI === s.NI,
          ),
      );
      setSelectedEmergencyItems([...existingFilter, ...newGrip]);
    } else {
      const paginatedItems = filteredEmergencyItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );
      setSelectedEmergencyItems((prev) =>
        prev.filter(
          (s) =>
            !paginatedItems.some(
              (c) =>
                (c.OI ?? c.Orden_Ingreso) === s.OI &&
                (c.IP ?? c.Item_Pago) === s.IP &&
                (c.NC ?? c.Numero_Caja) === s.NC &&
                (c.NI ?? c.Numero_Ingreso) === s.NI,
            ),
        ),
      );
    }
  };

  const toggleSelectEmergencyItem = (
    OI: number,
    IP: string,
    NC: number,
    NI: number,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedEmergencyItems((prev) => [...prev, { OI, IP, NC, NI }]);
    } else {
      setSelectedEmergencyItems((prev) =>
        prev.filter(
          (i) => !(i.OI === OI && i.IP === IP && i.NC === NC && i.NI === NI),
        ),
      );
    }
  };

  const isEmergencySelected = (
    OI: number,
    IP: string,
    NC: number,
    NI: number,
  ) => {
    return selectedEmergencyItems.some(
      (i) => i.OI === OI && i.IP === IP && i.NC === NC && i.NI === NI,
    );
  };

  const handleConfirmEmergency = async () => {
    if (selectedEmergencyItems.length === 0) {
      toast.warning("Debe seleccionar al menos un registro para restaurar.");
      return;
    }

    toast(({ closeToast }) => (
      <ConfirmationToast
        message={`¿Estás seguro de deshacer el reverso de estos ${selectedEmergencyItems.length} registros? Esto volverá a registrar el pago en Deudores con los datos exactos que habías anulado.`}
        onConfirm={async () => {
          setIsRestoring(true);
          const result = await deshacerUltimoReversoAction(
            JSON.stringify(selectedEmergencyItems),
          );
          setIsRestoring(false);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(
              "El reverso se deshizo correctamente. Pago(s) restaurado(s).",
            );
            setShowEmergencyModal(false);
            setPreviewData([]); // Limpiar la tabla
            setConfirmedTesoreria(false);
            setSelectedItems([]);
          }
        }}
        closeToast={closeToast}
      />
    ));
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
          solo los registros duplicados/erroneos.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-1">
              1. Pago no registrado en Tesorería.
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>El pago está en Deudores pero no en Tesorería.</li>
              <li>Ejecutar reversa para liberar órdenes (Retorno a deuda).</li>
              <li>
                <strong>Cajera/o:</strong> Reprocesa el pago con el{" "}
                <u>mismo folio</u>.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">
              2. Pago Registrado Parcialmente
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>
                Pago registrado en Tesorería, pero sin la totalidad de las
                órdenes ingresadas.
              </li>
              <li>
                <strong>Tesorería:</strong> Elimina .
              </li>
              <li>
                <strong>Informática:</strong> Reversa registros en Deudores.
              </li>
              <li>
                <strong>Cajera/o:</strong> Reprocesa el pago con el{" "}
                <u>mismo folio</u>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario de Búsqueda y Botón de Emergencia */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
            <IconSearch className="text-blue-600 w-4 h-4" />
            Buscar Pago
          </h2>

          <button
            type="button"
            onClick={handleOpenEmergency}
            disabled={isRestoring || loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            title="Deshacer el último reverso ejecutado"
          >
            <IconLifebuoy className="w-4 h-4" />
            {isRestoring ? "Cargando..." : "Botón de Emergencia (Deshacer)"}
          </button>
        </div>

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
                Folio de Caja u Orden Ingreso
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
                            ? new Date(row.Fecha_Emision).toLocaleDateString(
                                "es-CL",
                                { timeZone: "UTC" },
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {row.Fecha_Vencimiento
                            ? new Date(
                                row.Fecha_Vencimiento,
                              ).toLocaleDateString("es-CL", { timeZone: "UTC" })
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
                            ? new Date(row.Fecha_Pago).toLocaleDateString(
                                "es-CL",
                                { timeZone: "UTC" },
                              )
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

      {/* Modal Botón de Emergencia */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50 rounded-t-xl">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <IconLifebuoy className="w-5 h-5" />
                Deshacer Reverso (Botón de Emergencia)
              </h2>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selecciona los registros que deseas restaurar (volverán a
                  figurar como pagados en Deudores con sus datos originales).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Buscar (Folio, Caja, Orden, Item, RUT)
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-sm focus:ring-1 outline-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Ej: 1100272"
                      value={emergencySearchText}
                      onChange={(e) => {
                        setEmergencySearchText(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Filtrar por Fecha Transacción Original
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1.5 text-sm focus:ring-1 outline-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={emergencySearchDate}
                      onChange={(e) => {
                        setEmergencySearchDate(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="min-h-[380px] overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-400 text-red-600 focus:ring-red-500 w-4 h-4"
                          onChange={(e) =>
                            toggleSelectEmergencyAll(e.target.checked)
                          }
                          checked={
                            filteredEmergencyItems.slice(
                              (currentPage - 1) * itemsPerPage,
                              currentPage * itemsPerPage,
                            ).length > 0 &&
                            filteredEmergencyItems
                              .slice(
                                (currentPage - 1) * itemsPerPage,
                                currentPage * itemsPerPage,
                              )
                              .every((d: any) =>
                                isEmergencySelected(
                                  d.OI ?? d.Orden_Ingreso,
                                  d.IP ?? d.Item_Pago,
                                  d.NC ?? d.Numero_Caja,
                                  d.NI ?? d.Numero_Ingreso,
                                ),
                              )
                          }
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Hora Reverso
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Orden Ingreso
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Item Pago
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Caja
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Folio
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Fecha Trans. Original
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        RUT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmergencyItems
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      )
                      .map((row, index) => {
                        const OI = row.OI ?? row.Orden_Ingreso;
                        const IP = row.IP ?? row.Item_Pago;
                        const NC = row.NC ?? row.Numero_Caja;
                        const NI = row.NI ?? row.Numero_Ingreso;
                        const R = row.R ?? row.Rut;
                        const FP = row.FP ?? row.Fecha_Pago;
                        const selected = isEmergencySelected(OI, IP, NC, NI);
                        // Make key actually unique using the data plus an index fallback if duplicate items exist
                        const uniqueKey = `em-${index}-${OI}-${IP}-${NC}-${NI}`;

                        return (
                          <tr
                            key={uniqueKey}
                            className={
                              selected ? "bg-red-50/50" : "hover:bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="rounded border-gray-400 text-red-600 focus:ring-red-500 w-4 h-4"
                                checked={selected}
                                onChange={(e) =>
                                  toggleSelectEmergencyItem(
                                    OI,
                                    IP,
                                    NC,
                                    NI,
                                    e.target.checked,
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-medium">
                              {row.HoraReverso || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {OI}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {IP}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {NC}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {NI}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {FP
                                ? new Date(FP).toLocaleDateString("es-CL", {
                                    timeZone: "UTC",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{R}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredEmergencyItems.length > itemsPerPage && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-2 rounded-lg border shadow-sm">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        a{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredEmergencyItems.length,
                          )}
                        </span>{" "}
                        de{" "}
                        <span className="font-medium">
                          {filteredEmergencyItems.length}
                        </span>{" "}
                        resultados
                      </p>
                    </div>
                    <div>
                      <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Anterior</span>
                          <IconArrowNarrowLeft
                            className="h-7 w-7"
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(
                                  filteredEmergencyItems.length / itemsPerPage,
                                ),
                              ),
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(
                              filteredEmergencyItems.length / itemsPerPage,
                            )
                          }
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Siguiente</span>
                          <IconArrowNarrowRight
                            className="h-7 w-7"
                            aria-hidden="true"
                          />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEmergency}
                disabled={selectedEmergencyItems.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <IconRotateClockwise className="w-4 h-4" />
                Restaurar Seleccionados ({selectedEmergencyItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
