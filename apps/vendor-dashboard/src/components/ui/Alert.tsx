"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cx } from "@/lib/component-utils";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  className?: string;
}

const variantStyles = {
  info: "bg-info-500/10 border-info-500/30 text-info-300",
  success: "bg-success-500/10 border-success-500/30 text-success-300",
  warning: "bg-warning-500/10 border-warning-500/30 text-warning-300",
  error: "bg-error-500/10 border-error-500/30 text-error-300",
};

const iconMap = {
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
};

export function Alert({
  children,
  variant = "info",
  title,
  icon,
  onClose,
  dismissible = false,
  className,
}: AlertProps) {
  return (
    <div
      className={cx(
        "rounded-lg border p-4 animate-slide-down transition-motion",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {(icon || !dismissible) && (
          <div className="mt-0.5 flex-shrink-0">
            {icon || iconMap[variant]}
          </div>
        )}

        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <p className="text-sm opacity-90">{children}</p>
        </div>

        {dismissible && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 p-1 rounded hover:opacity-75 transition-micro focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-current outline-none"
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
