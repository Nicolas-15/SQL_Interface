"use client";

import {
  IconX,
  IconShieldCheck,
  IconClock,
  IconUser,
  IconDatabase,
  IconInfoCircle,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  audit: Audit;
  onClose: () => void;
}

export default function AuditDetailModal({ audit, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Detalles de Auditoría
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <IconX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Action Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Módulo
              </label>
              <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                <IconDatabase className="w-4 h-4 text-blue-500" />
                {audit.modulo}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Acción / Registro
              </label>
              <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                <IconInfoCircle className="w-4 h-4 text-orange-500" />
                {audit.registro}
              </div>
            </div>
          </div>

          {/* User & Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Usuario Responsable
              </label>
              <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                <IconUser className="w-4 h-4 text-purple-500" />
                <span className="truncate">
                  {audit.nombre_usuario || "Sistema"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Fecha y Hora
              </label>
              <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                <IconClock className="w-4 h-4 text-green-500" />
                {format(new Date(audit.fecha_cambio), "PPpp", { locale: es })}
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Descripción del Evento
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[120px]">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {audit.descripcion}
              </p>
            </div>
          </div>

          {/* metadata if available (placeholder for future growth) */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400 italic">
              <IconInfoCircle className="w-3.5 h-3.5" />
              ID Auditoría: {audit.id_auditoria}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
