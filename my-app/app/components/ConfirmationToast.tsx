"use client";

import { IconAlertTriangle } from "@tabler/icons-react";

type ConfirmationToastProps = {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  closeToast?: () => void;
};

export default function ConfirmationToast({
  message,
  onConfirm,
  onCancel,
  closeToast,
}: ConfirmationToastProps) {
  const handleConfirm = () => {
    onConfirm();
    if (closeToast) closeToast();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (closeToast) closeToast();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-amber-500 mt-0.5">
          <IconAlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-sm text-slate-700 font-medium leading-tight">
          {message}
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
