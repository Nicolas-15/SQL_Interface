"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  IconCopy,
  IconUserPlus,
  IconRefresh,
  IconAlertTriangle,
  IconArrowRight,
} from "@tabler/icons-react";
import ConfirmationToast from "@/app/components/ConfirmationToast";
import {
  getUsuariosDropdownAction,
  replicarPermisosAction,
  crearUsuarioAction,
} from "@/app/lib/action/usuario/usuario.action";
import { UsuarioDB } from "@/app/repositories/usuariocas.repository";

import Select from "react-select";

export default function GestionCasClient() {
  const [activeTab, setActiveTab] = useState<"replicar" | "crear">("replicar");
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  // Cargar usuarios al montar el componente
  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      const result = await getUsuariosDropdownAction();
      if (result.error) {
        toast.error(result.error);
      } else {
        setUsuarios(result.data || []);
      }
      setLoadingUsers(false);
    }
    loadUsers();
  }, []);

  // Agrupar opciones por sistema para React Select
  const groupedOptions = Object.values(
    usuarios.reduce(
      (acc, u) => {
        const sistema = u.Usuar_Sistema;
        if (!acc[sistema]) {
          acc[sistema] = {
            label: `Sistema ${sistema}`,
            options: [],
          };
        }
        acc[sistema].options.push({
          value: `${u.Usuar_Cuenta}|${u.Usuar_Sistema}`,
          label: `${u.Usuar_Name} (${u.Usuar_Cuenta})`, // Clean label for search
          rawLabel: u.Usuar_Name,
          cuenta: u.Usuar_Cuenta,
          sistema: u.Usuar_Sistema,
        });
        return acc;
      },
      {} as Record<number, { label: string; options: any[] }>,
    ),
  ).sort((a, b) => {
    // Sort systems numerically if possible
    const sysA = parseInt(a.label.replace("Sistema ", ""));
    const sysB = parseInt(b.label.replace("Sistema ", ""));
    return sysA - sysB;
  });

  // Estilos personalizados para React Select
  const customStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: "#e5e7eb",
      borderRadius: "0.5rem",
      padding: "2px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    groupHeading: (base: any) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      color: "#374151",
      fontWeight: "600",
      padding: "8px 12px",
      fontSize: "0.75rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "500px", // Increased height to show more items
    }),
    option: (
      base: any,
      state: { isFocused: boolean; isSelected: boolean },
    ) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#eff6ff"
        : state.isFocused
          ? "#f9fafb"
          : "white",
      color: state.isSelected ? "#1e40af" : "#1f2937",
      cursor: "pointer",
      padding: "8px 12px",
      fontSize: "0.875rem",
    }),
  };

  // Renderizado personalizado de opciones
  const formatOptionLabel = (option: any, { context }: any) => {
    if (context === "menu") {
      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{option.rawLabel}</span>
            <span className="text-xs text-gray-500 font-mono">
              {option.cuenta}
            </span>
          </div>
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Sis: {option.sistema}
          </span>
        </div>
      );
    }
    // Contexto === 'value' (elemento seleccionado)
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{option.rawLabel}</span>
        <span className="text-gray-500 text-sm">({option.cuenta})</span>
        <span className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded border border-blue-100">
          Sis: {option.sistema}
        </span>
      </div>
    );
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
          closeToast();
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

    const cuenta = formData.get("cuenta") as string;
    const nombre = formData.get("nombre") as string;

    if (!cuenta || !nombre) {
      toast.warning("Todos los campos son obligatorios");
      return;
    }

    toast(({ closeToast }) => (
      <ConfirmationToast
        message={`¿Está seguro de crear el usuario ${cuenta} en el Sistema ${baseSistemaStr} copiando el perfil de ${baseCuenta}?`}
        onConfirm={async () => {
          setProcessing(true);
          const result = await crearUsuarioAction(formData);
          setProcessing(false);
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(result.message);
            // Recargar usuarios para incluir el nuevo
            const updatedUsers = await getUsuariosDropdownAction();
            if (updatedUsers.data) setUsuarios(updatedUsers.data);
            // Resetear formulario
            setSelectedBase(null);
          }
          closeToast();
        }}
        closeToast={closeToast}
      />
    ));
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
        </div>

        <div className="p-6">
          {loadingUsers ? (
            <div className="flex justify-center p-8 text-gray-400 animate-pulse">
              Cargando usuarios...
            </div>
          ) : (
            <>
              {activeTab === "replicar" && (
                <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 flex gap-3">
                    <IconAlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">
                        Advertencia de Seguridad
                      </p>
                      <p>
                        Esta acción eliminará todos los permisos actuales del
                        usuario de destino y los reemplazará con los del usuario
                        de origen.
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
                            Seleccione el usuario del cual se copiarán los
                            permisos.
                          </label>
                          <Select
                            instanceId="origen-select"
                            options={groupedOptions}
                            value={selectedOrigen}
                            onChange={(val: any) => setSelectedOrigen(val)}
                            placeholder="Buscar usuario origen..."
                            isClearable
                            styles={customStyles}
                            formatOptionLabel={formatOptionLabel}
                            className="text-sm"
                            noOptionsMessage={() =>
                              "No se encontraron usuarios"
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
                            Seleccione el usuario que recibirá los nuevos
                            permisos.
                          </label>
                          <Select
                            instanceId="destino-select"
                            options={groupedOptions}
                            value={selectedDestino}
                            onChange={(val: any) => setSelectedDestino(val)}
                            placeholder="Buscar usuario destino..."
                            isClearable
                            styles={customStyles}
                            formatOptionLabel={formatOptionLabel}
                            className="text-sm"
                            noOptionsMessage={() =>
                              "No se encontraron usuarios"
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
                        disabled={
                          processing || !selectedOrigen || !selectedDestino
                        }
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

                  <form action={handleCrear} className="space-y-8">
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
                          <Select
                            instanceId="base-select"
                            options={groupedOptions}
                            value={selectedBase}
                            onChange={(val: any) => setSelectedBase(val)}
                            placeholder="Buscar usuario plantilla..."
                            isClearable
                            styles={customStyles}
                            formatOptionLabel={formatOptionLabel}
                            className="text-sm"
                            noOptionsMessage={() =>
                              "No se encontraron usuarios"
                            }
                            maxMenuHeight={500}
                            menuPlacement="auto"
                          />
                        </div>
                      </div>

                      {/* NEW USER PANEL */}
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                          <IconUserPlus className="w-5 h-5 text-gray-500" />
                          2. Datos Nuevo Usuario
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">
                              Cuenta (Rut/Login)
                            </label>
                            <input
                              name="cuenta"
                              type="text"
                              required
                              maxLength={10}
                              placeholder="EJ: JPEREZ"
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase bg-white"
                            />
                            <p className="text-xs text-gray-500">
                              Máx. 10 caracteres
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">
                              Nombre Completo
                            </label>
                            <input
                              name="nombre"
                              type="text"
                              required
                              placeholder="EJ: JUAN PEREZ"
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase bg-white"
                            />
                          </div>
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
                            Crear Usuario
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
