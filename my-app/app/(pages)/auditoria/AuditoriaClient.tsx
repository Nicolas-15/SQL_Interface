"use client";

import { useState } from "react";
import {
  IconShieldCheck,
  IconSearch,
  IconFilter,
  IconUser,
  IconClock,
  IconChevronRight,
  IconLock,
  IconDatabase,
  IconUsers,
  IconNews,
  IconAlertCircle,
  IconExternalLink,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AuditDetailModal from "@/app/components/AuditDetailModal";

interface Audit {
  id_auditoria: string;
  id_usuario: string;
  nombre_usuario?: string | null;
  modulo: string;
  registro: string;
  fecha_cambio: string;
  descripcion: string;
}

interface Props {
  initialAudits: Audit[];
}

const MODULOS = [
  "TODOS",
  "TESORERIA",
  "USUARIOS",
  "TITULARES",
  "USUARIOS_CAS",
  "REGULARIZACION",
  "REPORTES",
  "GENERAL",
];

export default function AuditoriaClient({ initialAudits }: Props) {
  const [audits, setAudits] = useState<Audit[]>(initialAudits);
  const [search, setSearch] = useState("");
  const [moduloFilter, setModuloFilter] = useState("TODOS");
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAudits = audits.filter((a) => {
    const matchesSearch =
      a.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      a.registro.toLowerCase().includes(search.toLowerCase()) ||
      (a.nombre_usuario?.toLowerCase().includes(search.toLowerCase()) ??
        false) ||
      a.id_usuario.toLowerCase().includes(search.toLowerCase());

    const matchesModulo = moduloFilter === "TODOS" || a.modulo === moduloFilter;

    return matchesSearch && matchesModulo;
  });

  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const paginatedAudits = filteredAudits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getModuloBadge = (modulo: string) => {
    const styles: Record<string, string> = {
      AUTH: "bg-purple-100 text-purple-700 border-purple-200",
      TESORERIA: "bg-green-100 text-green-700 border-green-200",
      USUARIOS: "bg-blue-100 text-blue-700 border-blue-200",
      TITULARES: "bg-yellow-100 text-yellow-700 border-yellow-200",
      USUARIOS_CAS: "bg-indigo-100 text-indigo-700 border-indigo-200",
      REGULARIZACION: "bg-orange-100 text-orange-700 border-orange-200",
      REPORTES: "bg-cyan-100 text-cyan-700 border-cyan-200",
      GENERAL: "bg-gray-100 text-gray-700 border-gray-200",
    };

    const icons: Record<string, any> = {
      AUTH: IconLock,
      TESORERIA: IconDatabase,
      USUARIOS: IconUsers,
      TITULARES: IconNews,
      USUARIOS_CAS: IconUsers,
      REGULARIZACION: IconAlertCircle,
      REPORTES: IconDatabase,
      GENERAL: IconShieldCheck,
    };

    const Icon = icons[modulo] || IconShieldCheck;

    return (
      <span
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[modulo] || styles.GENERAL}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {modulo}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IconShieldCheck className="w-8 h-8 text-blue-600" />
            Bitácora de Auditoría
          </h1>
          <p className="text-gray-500">
            Seguimiento de acciones y cambios críticos en el sistema.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descripción, acción o ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <IconFilter className="w-4 h-4 text-gray-500" />
          <select
            value={moduloFilter}
            onChange={(e) => {
              setModuloFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            {MODULOS.map((m) => (
              <option key={m} value={m}>
                {m === "TODOS" ? "Todos los Módulos" : m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Módulo / Acción
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Fecha
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedAudits.length > 0 ? (
                paginatedAudits.map((audit) => (
                  <tr
                    key={audit.id_auditoria}
                    className="hover:bg-blue-50/30 transition-colors duration-200 group animate-in slide-in-from-top-2"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {getModuloBadge(audit.modulo)}
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {audit.registro}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <IconUser className="w-4 h-4" />
                        </div>
                        <span className="font-medium truncate">
                          {audit.nombre_usuario || "Usuario Desconocido"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-md line-clamp-2 italic">
                        "{audit.descripcion}"
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {format(
                            new Date(audit.fecha_cambio),
                            "dd MMM, yyyy",
                            { locale: es },
                          )}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {format(new Date(audit.fecha_cambio), "HH:mm:ss")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedAudit(audit)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white bg-blue-50/50 border border-blue-100 rounded-lg transition-all active:scale-95"
                      >
                        <IconExternalLink className="w-3.5 h-3.5" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                        <IconSearch className="w-8 h-8 text-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-900 font-bold">
                          Sin resultados encontrados
                        </p>
                        <p className="text-gray-400 text-sm">
                          Prueba ajustando los filtros o el término de búsqueda.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearch("");
                          setModuloFilter("TODOS");
                          setCurrentPage(1);
                        }}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                      >
                        Limpiar todos los filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50 gap-4">
            <p className="text-sm text-gray-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, filteredAudits.length)} de{" "}
              {filteredAudits.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1,
                  )
                  .map((page, index, array) => (
                    <span key={page} className="flex items-center gap-1">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-white border border-transparent hover:border-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedAudit && (
        <AuditDetailModal
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />
      )}
    </div>
  );
}
