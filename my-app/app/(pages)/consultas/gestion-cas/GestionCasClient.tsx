"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import {
  IconCopy,
  IconUserPlus,
  IconRefresh,
  IconAlertTriangle,
  IconArrowRight,
  IconTrashX,
  IconCirclePlus,
  IconMinus,
  IconCheck,
} from "@tabler/icons-react";
import ConfirmationToast from "@/app/components/ConfirmationToast";
import {
  getUsuariosDropdownAction,
  replicarPermisosAction,
  crearUsuarioAction,
  eliminarUsuarioAction,
} from "@/app/lib/action/usuario/usuario.action";
import { UsuarioDB } from "@/app/repositories/usuariocas.repository";

import AsyncSelect from "react-select/async";
import { customStyles, formatOptionLabel } from "./selectUtils";

export default function GestionCasClient() {
  const [activeTab, setActiveTab] = useState<"replicar" | "crear" | "eliminar">(
    "replicar",
  );
  const [processing, setProcessing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearchRef = useRef<string>("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Estados de react para el select
  interface OptionType {
    value: string;
    label: string;
    rawLabel: string;
    cuenta: string;
    sistema: number;
  }

  const [selectedOrigen, setSelectedOrigen] = useState<OptionType | null>(null);
  const [selectedDestino, setSelectedDestino] = useState<OptionType | null>(
    null,
  );
  const [selectedBase, setSelectedBase] = useState<OptionType | null>(null);
  const [selectedEliminar, setSelectedEliminar] = useState<OptionType | null>(
    null,
  );

  const [nuevosUsuarios, setNuevosUsuarios] = useState<
    { cuenta: string; nombre: string }[]
  >([{ cuenta: "", nombre: "" }]);

  const [usuariosCreados, setUsuariosCreados] = useState<
    { cuenta: string; nombre: string; timestamp: Date }[]
  >([]);

  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Cargar desde LocalStorage al montar (Hydration-safe)
  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem("gestion_cas_creados_log");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const revived = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setUsuariosCreados(revived);
      } catch (e) {
        console.error("Error validando localstorage de usuarios", e);
      }
    }
  }, []);

  // 2. Guardar a LocalStorage cada vez que cambie, si ya estamos en el cliente
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        "gestion_cas_creados_log",
        JSON.stringify(usuariosCreados),
      );
    }
  }, [usuariosCreados, isHydrated]);

  const loadUsuarios = (
    inputValue: string,
    callback: (options: any[]) => void,
  ) => {
    latestSearchRef.current = inputValue;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!inputValue || inputValue.length < 2) {
      setLoadingSearch(false);
      callback([]);
      return;
    }

    setLoadingSearch(true);

    debounceRef.current = setTimeout(async () => {
      const currentSearch = inputValue;
      const result = await getUsuariosDropdownAction(inputValue);

      if (currentSearch !== latestSearchRef.current) {
        return;
      }

      setLoadingSearch(false);

      if (result.error || !result.data) {
        callback([]);
        return;
      }

      // Devolver lista plana para el select
      const flatOptions = (result.data as UsuarioDB[]).map((u) => ({
        value: `${u.Usuar_Cuenta}|${u.Usuar_Sistema}`,
        label: `${u.Usuar_Name} (${u.Usuar_Cuenta})`,
        rawLabel: u.Usuar_Name,
        cuenta: u.Usuar_Cuenta,
        sistema: u.Usuar_Sistema,
      }));

      callback(flatOptions);
    }, 400); // 400ms debounce
  };

  const handleReplicar = async (formData: FormData) => {
    if (!selectedOrigen || !selectedDestino) {
      toast.warning("Seleccione usuario de origen y destino");
      return;
    }

    // Extracción del sistema de la selección
    // Formato del valor: "COUNT|SYSTEM"
    const [origenCuenta, origenSistemaStr] = selectedOrigen.value.split("|");
    const [destinoCuenta, destinoSistemaStr] = selectedDestino.value.split("|");

    // Validación adicional por si acaso
    const origenSistema = Number(origenSistemaStr);
    const destinoSistema = Number(destinoSistemaStr);

    if (origenSistema !== destinoSistema) {
      toast.error(
        `Error: El usuario origen pertenece al sistema ${origenSistema} y el destino al sistema ${destinoSistema}. Deben ser del mismo sistema.`,
      );
      return;
    }

    if (origenCuenta === destinoCuenta) {
      toast.warning("Origen y destino no pueden ser el mismo usuario");
      return;
    }

    // Actualización de FormData con valores correctos
    formData.set("origen", origenCuenta);
    formData.set("destino", destinoCuenta);
    formData.set("sistema", String(origenSistema));

    // Acceso simple a la etiqueta desde la estructura de opciones

    const origenLabel = selectedOrigen.label;
    const destinoLabel = selectedDestino.label;

    toast(({ closeToast }) => (
      <ConfirmationToast
        message={
          <span>
            ¿Está seguro de replicar los permisos de{" "}
            <strong>{selectedOrigen.rawLabel}</strong> ({origenCuenta}) a{" "}
            <strong>{selectedDestino.rawLabel}</strong> ({destinoCuenta}) en el{" "}
            <strong>Sistema {origenSistema}</strong>?
            <br />
            <br />
            <span className="text-red-600 text-sm">
              Esto ELIMINARÁ los permisos actuales de {destinoCuenta}.
            </span>
          </span>
        }
        onConfirm={async () => {
          setProcessing(true);
          const result = await replicarPermisosAction(formData);
          setProcessing(false);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(result.message);
            // Resetear selección
            setSelectedOrigen(null);
            setSelectedDestino(null);
          }
        }}
        closeToast={closeToast}
      />
    ));
  };

  const handleCrear = async (formData: FormData) => {
    if (!selectedBase) {
      toast.warning("Seleccione un usuario base");
      return;
    }

    const [baseCuenta, baseSistemaStr] = selectedBase.value.split("|");
    formData.set("base", baseCuenta);
    formData.set("sistema", baseSistemaStr);

    // Inyectar el arreglo JSON
    formData.set("usuarios", JSON.stringify(nuevosUsuarios));

    // Validar el arreglo vacío en frontend
    const validUsers = nuevosUsuarios.filter(
      (u) => u.cuenta.trim() && u.nombre.trim(),
    );
    if (validUsers.length === 0) {
      toast.warning(
        "Debe agregar al menos un usuario válido (cuenta y nombre).",
      );
      return { success: false };
    }

    return new Promise<{ success: boolean }>((resolve) => {
      toast(({ closeToast }) => (
        <ConfirmationToast
          message={`¿Está seguro de crear ${validUsers.length} usuario(s) en el Sistema ${baseSistemaStr} copiando el perfil de ${baseCuenta}?`}
          onConfirm={async () => {
            setProcessing(true);
            const result = await crearUsuarioAction(formData);
            setProcessing(false);

            if (result.error) {
              toast.error(result.error);
              resolve({ success: false });
            } else {
              if (
                result.message &&
                result.creadosList &&
                result.creadosList.length > 0
              ) {
                toast.success(result.message);

                // Añadir al registro histórico de la sesión actual
                const time = new Date();
                const creadosConTiempo = result.creadosList.map((u: any) => ({
                  ...u,
                  timestamp: time,
                }));
                setUsuariosCreados((prev) => [...creadosConTiempo, ...prev]);
              } else if (result.message) {
                toast.success(result.message);
              }

              // Resetear formulario interno
              setSelectedBase(null);
              setNuevosUsuarios([{ cuenta: "", nombre: "" }]);
              resolve({ success: true });
            }
          }}
          closeToast={() => {
            if (closeToast) closeToast();
            resolve({ success: false });
          }}
        />
      ));
    });
  };

  const onSubmitCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Si la promesa devuelve success, limpiamos los inputs nativos
    const result = await handleCrear(formData);
    if (result && result.success) {
      form.reset();
    }
  };

  const handleEliminar = async (formData: FormData) => {
    if (!selectedEliminar) {
      toast.warning("Seleccione un usuario para eliminar");
      return { success: false };
    }

    const [cuentaStr, sistemaStr] = selectedEliminar.value.split("|");
    formData.set("cuenta", cuentaStr);
    formData.set("sistema", sistemaStr);

    const isGlobal = formData.get("modoGlobal") === "true";

    return new Promise<{ success: boolean }>((resolve) => {
      toast(({ closeToast }) => (
        <ConfirmationToast
          message={
            <span>
              ¿Está MÁXIMAMENTE seguro de querer eliminar a{" "}
              <strong>{selectedEliminar.rawLabel}</strong> ({cuentaStr})?
              <br />
              <br />
              <span className="text-red-600 font-bold">
                {isGlobal
                  ? "¡ADVERTENCIA CRÍTICA! Esta acción eliminará al usuario de TODOS LOS SISTEMAS a nivel global. Esta acción no se puede deshacer."
                  : `Solo se eliminará del Sistema ${sistemaStr}.`}
              </span>
            </span>
          }
          onConfirm={async () => {
            setProcessing(true);
            const result = await eliminarUsuarioAction(formData);
            setProcessing(false);

            if (result.error) {
              toast.error(result.error);
              resolve({ success: false });
            } else {
              toast.success(result.message);
              setSelectedEliminar(null);
              resolve({ success: true });
            }
          }}
          closeToast={() => {
            if (closeToast) closeToast();
            resolve({ success: false });
          }}
        />
      ));
    });
  };

  const onSubmitEliminar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await handleEliminar(formData);
    if (result && result.success) {
      form.reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <button
            onClick={() => setActiveTab("replicar")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${
                activeTab === "replicar"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <IconCopy className="w-5 h-5" />
            Replicar Permisos
          </button>
          <button
            onClick={() => setActiveTab("crear")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${
                activeTab === "crear"
                  ? "bg-white text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <IconUserPlus className="w-5 h-5" />
            Crear Usuario
          </button>
          <button
            onClick={() => setActiveTab("eliminar")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${
                activeTab === "eliminar"
                  ? "bg-white text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <IconTrashX className="w-5 h-5" />
            Eliminar Usuario
          </button>
        </div>

        <div className="p-6">
          {activeTab === "replicar" && (
            <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 flex gap-3">
                <IconAlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Advertencia de Seguridad</p>
                  <p>
                    Esta acción eliminará todos los permisos actuales del
                    usuario de destino y los reemplazará con los del usuario de
                    origen.
                  </p>
                </div>
              </div>

              <form action={handleReplicar} className="space-y-8">
                <input type="hidden" name="sistema" value="2" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* ORIGEN PANEL */}
                  <div className="lg:col-span-5 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b border-gray-200 pb-2">
                      <IconCopy className="w-5 h-5" />
                      <span>Usuario Origen (Fuente)</span>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm text-gray-600">
                        Seleccione el usuario del cual se copiarán los permisos.
                      </label>
                      <AsyncSelect
                        instanceId="origen-select"
                        cacheOptions
                        loadOptions={loadUsuarios}
                        defaultOptions={false}
                        isLoading={loadingSearch}
                        value={selectedOrigen}
                        onChange={(val: any) => setSelectedOrigen(val)}
                        placeholder="Escriba al menos 2 letras..."
                        isClearable
                        styles={customStyles}
                        formatOptionLabel={formatOptionLabel}
                        className="text-sm"
                        noOptionsMessage={({ inputValue }) =>
                          inputValue.length < 2
                            ? "Escriba al menos 2 caracteres"
                            : "No se encontraron usuarios"
                        }
                        maxMenuHeight={500}
                        menuPlacement="auto"
                      />
                    </div>
                  </div>

                  {/* ARROW */}
                  <div className="hidden lg:flex lg:col-span-2 items-center justify-center pt-12">
                    <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100 text-gray-400">
                      <IconArrowRight className="w-6 h-6" />
                    </div>
                  </div>

                  {/* DESTINO PANEL */}
                  <div className="lg:col-span-5 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-purple-700 font-semibold border-b border-gray-200 pb-2">
                      <IconRefresh className="w-5 h-5" />
                      <span>Usuario Destino (Objetivo)</span>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm text-gray-600">
                        Seleccione el usuario que recibirá los nuevos permisos.
                      </label>
                      <AsyncSelect
                        instanceId="destino-select"
                        cacheOptions
                        loadOptions={loadUsuarios}
                        defaultOptions={false}
                        isLoading={loadingSearch}
                        value={selectedDestino}
                        onChange={(val: any) => setSelectedDestino(val)}
                        placeholder="Escriba al menos 2 letras..."
                        isClearable
                        styles={customStyles}
                        formatOptionLabel={formatOptionLabel}
                        className="text-sm"
                        noOptionsMessage={({ inputValue }) =>
                          inputValue.length < 2
                            ? "Escriba al menos 2 caracteres"
                            : "No se encontraron usuarios"
                        }
                        maxMenuHeight={500}
                        menuPlacement="auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={processing || !selectedOrigen || !selectedDestino}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {processing ? (
                      <>
                        <IconRefresh className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <IconCopy className="w-5 h-5" />
                        Confirmar y Replicar Permisos
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "crear" && (
            <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-purple-900 flex gap-3">
                <IconUserPlus className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">
                    Creación de Nuevo Usuario
                  </p>
                  <p>
                    Esta herramienta permite crear un usuario nuevo clonando
                    exáctamente la configuración de otro.
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmitCrear} className="space-y-8">
                <input type="hidden" name="sistema" value="2" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* BASE USER PANEL */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <IconCopy className="w-5 h-5 text-gray-500" />
                      1. Seleccionar Plantilla
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600">
                        Usuario Base (copiar desde)
                      </label>
                      <AsyncSelect
                        instanceId="base-select"
                        cacheOptions
                        loadOptions={loadUsuarios}
                        defaultOptions={false}
                        isLoading={loadingSearch}
                        value={selectedBase}
                        onChange={(val: any) => setSelectedBase(val)}
                        placeholder="Escriba al menos 2 letras..."
                        isClearable
                        styles={customStyles}
                        formatOptionLabel={formatOptionLabel}
                        className="text-sm"
                        noOptionsMessage={({ inputValue }) =>
                          inputValue.length < 2
                            ? "Escriba al menos 2 caracteres"
                            : "No se encontraron usuarios"
                        }
                        maxMenuHeight={500}
                        menuPlacement="auto"
                      />
                    </div>
                  </div>

                  {/* NEW USERS PANEL (BULK) */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <IconUserPlus className="w-5 h-5 text-gray-500" />
                        2. Datos Nuevos Usuarios
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setNuevosUsuarios([
                            ...nuevosUsuarios,
                            { cuenta: "", nombre: "" },
                          ])
                        }
                        className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition"
                      >
                        <IconCirclePlus className="w-4 h-4" />
                        Agregar Fila
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                      {nuevosUsuarios.map((usuario, index) => (
                        <div
                          key={index}
                          className="flex gap-4 items-start bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group"
                        >
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">
                                  Cuenta (Rut/Login){" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  maxLength={10}
                                  placeholder="EJ: JPEREZ"
                                  value={usuario.cuenta}
                                  onChange={(e) => {
                                    const next = [...nuevosUsuarios];
                                    next[index].cuenta =
                                      e.target.value.toUpperCase();
                                    setNuevosUsuarios(next);
                                  }}
                                  className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                />
                                <p className="text-[10px] text-gray-500">
                                  Máximo 10 caracteres.
                                </p>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">
                                  Nombre Completo{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  maxLength={60}
                                  placeholder="EJ: JUAN PEREZ"
                                  value={usuario.nombre}
                                  onChange={(e) => {
                                    const next = [...nuevosUsuarios];
                                    next[index].nombre =
                                      e.target.value.toUpperCase();
                                    setNuevosUsuarios(next);
                                  }}
                                  className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {nuevosUsuarios.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...nuevosUsuarios];
                                next.splice(index, 1);
                                setNuevosUsuarios(next);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition self-center"
                              title="Eliminar fila"
                            >
                              <IconMinus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={processing || !selectedBase}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {processing ? (
                      <>
                        <IconRefresh className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <IconUserPlus className="w-5 h-5" />
                        Crear Usuarios
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* RECENTLY CREATED USERS LOG */}
              {usuariosCreados.length > 0 && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm overflow-hidden animate-fade-in mt-8">
                  <div className="bg-emerald-100/50 px-6 py-4 flex items-center justify-between border-b border-emerald-200">
                    <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                      <IconCheck className="w-5 h-5 text-emerald-600" />
                      Registro de Usuarios Creados
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                        Guardados: {usuariosCreados.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setUsuariosCreados([])}
                        className="text-xs bg-white text-emerald-700 hover:bg-red-50 hover:text-red-600 px-2 py-1 rounded border border-emerald-200 hover:border-red-200 transition-colors flex items-center gap-1 shadow-sm"
                        title="Limpiar registro guardado"
                      >
                        <IconTrashX className="w-3.5 h-3.5" />
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-emerald-700 mb-4">
                      Estos usuarios fueron creados exitosamente. Los datos se
                      mantienen aquí aunque recargue la página, hasta que
                      presione limpiar.
                    </p>

                    <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden shadow-inner">
                      <table className="min-w-full divide-y divide-emerald-100">
                        <thead className="bg-emerald-50/50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                            >
                              Hora
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                            >
                              Cuenta
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                            >
                              Nombre Completo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-emerald-50">
                          {usuariosCreados.map((u, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-emerald-50/30 transition-colors"
                            >
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                {u.timestamp.toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-emerald-700 selection:bg-emerald-200">
                                {u.cuenta}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 selection:bg-emerald-200">
                                {u.nombre}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "eliminar" && (
            <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-900 flex gap-3">
                <IconAlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold mb-1 text-red-700">
                    Zona de Riesgo: Eliminación de Usuarios
                  </p>
                  <p>
                    Esta acción destruirá los accesos y registros del usuario
                    seleccionado. Puedes restringir el borrado al sistema
                    actual, o hacer un borrado global en toda la plataforma. Use
                    con extrema precaución.
                  </p>
                </div>
              </div>

              <form
                onSubmit={onSubmitEliminar}
                className="space-y-8 bg-white p-8 rounded-xl border border-red-100 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-400 to-red-600"></div>

                <div className="space-y-6">
                  {/* SEARCH PANEL */}
                  <div className="space-y-2">
                    <label className="flex font-medium text-gray-700 items-center gap-2">
                      <IconTrashX className="w-5 h-5 text-red-500" />
                      1. Seleccione el Usuario a Eliminar
                    </label>
                    <AsyncSelect
                      instanceId="eliminar-select"
                      cacheOptions
                      loadOptions={loadUsuarios}
                      defaultOptions={false}
                      isLoading={loadingSearch}
                      value={selectedEliminar}
                      onChange={(val: any) => setSelectedEliminar(val)}
                      placeholder="Escriba al menos 2 letras..."
                      isClearable
                      styles={customStyles}
                      formatOptionLabel={formatOptionLabel}
                      className="text-sm"
                      noOptionsMessage={({ inputValue }) =>
                        inputValue.length < 2
                          ? "Escriba al menos 2 caracteres"
                          : "No se encontraron usuarios"
                      }
                      maxMenuHeight={500}
                      menuPlacement="auto"
                    />
                  </div>

                  {/* SCOPE SELECTION */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="block font-medium text-gray-700">
                      2. Alcance de la Eliminación
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-red-300 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 overflow-hidden has-checked:border-red-500 has-checked:bg-red-50">
                        <input
                          type="radio"
                          name="modoGlobal"
                          value="false"
                          defaultChecked
                          className="sr-only"
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="block text-sm font-medium text-gray-900">
                              Solo de este Sistema
                            </span>
                            <span className="mt-1 flex items-center text-sm text-gray-500">
                              Elimina permisos y acceso únicamente para el
                              módulo seleccionado.
                            </span>
                          </span>
                        </span>
                      </label>

                      <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-red-700 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 overflow-hidden has-checked:border-red-700 has-checked:bg-red-100">
                        <input
                          type="radio"
                          name="modoGlobal"
                          value="true"
                          className="sr-only"
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="block text-sm font-medium text-red-800">
                              Eliminación Global
                            </span>
                            <span className="mt-1 flex items-center text-sm text-red-600 font-semibold">
                              Borra al usuario y TODOS sus permisos de TODOS los
                              sistemas municipales simultáneamente.
                            </span>
                          </span>
                        </span>
                        <IconAlertTriangle className="h-5 w-5 text-red-700 self-center absolute top-4 right-4" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={processing || !selectedEliminar}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {processing ? (
                      <>
                        <IconRefresh className="w-5 h-5 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <IconTrashX className="w-5 h-5" />
                        Ejecutar Eliminación
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
