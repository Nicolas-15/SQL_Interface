"use client";

import { IconAlertTriangle } from "@tabler/icons-react";

type ConfirmationToastProps = {
  message: string | React.ReactNode;
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
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-start gap-3">
        <div className="bg-red-50 p-2 rounded-full shrink-0 text-red-600">
          <IconAlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-900">
            ¿Confirmar acción?
          </h4>
          <p className="text-sm text-gray-600 leading-snug">{message}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all shadow-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          Sí, confirmar
        </button>
      </div>
    </div>
  );
}
