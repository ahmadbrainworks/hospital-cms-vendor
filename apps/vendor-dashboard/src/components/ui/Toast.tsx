"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cx } from "@/lib/component-utils";

type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastProps {
  id: string;
  message: ReactNode;
  variant?: ToastVariant;
  onClose: (id: string) => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles = {
  info: "bg-info-900/40 border-info-500/30 text-info-200",
  success: "bg-success-900/40 border-success-500/30 text-success-200",
  warning: "bg-warning-900/40 border-warning-500/30 text-warning-200",
  error: "bg-error-900/40 border-error-500/30 text-error-200",
};

const iconMap = {
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
};

export function Toast({
  id,
  message,
  variant = "info",
  onClose,
  duration = 5000,
  action,
}: ToastProps) {
  return (
    <div
      className={cx(
        "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-up transition-motion",
        variantStyles[variant]
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex-shrink-0">
        {iconMap[variant]}
      </div>

      <div className="flex-1 text-sm">
        {message}
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="flex-shrink-0 font-medium underline hover:opacity-75 transition-micro outline-none focus-visible:ring-1 focus-visible:ring-current rounded px-2"
        >
          {action.label}
        </button>
      )}

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded hover:opacity-75 transition-micro focus-visible:ring-1 focus-visible:ring-current outline-none"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
