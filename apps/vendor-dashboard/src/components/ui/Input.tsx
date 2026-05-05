"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { inputStyles, cx } from "@/lib/component-utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: ReactNode;
  required?: boolean;
}

export function Input({
  label,
  error,
  success = false,
  helperText,
  icon,
  required = false,
  className,
  ...props
}: InputProps) {
  const baseClass = cx(
    inputStyles.base,
    inputStyles.border,
    inputStyles.focus,
    inputStyles.disabled,
    inputStyles.transition,
    error ? inputStyles.error : success && inputStyles.success,
    icon && "pl-12",
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 flex items-center justify-center pointer-events-none w-5 h-5">
            {icon}
          </div>
        )}
        <input
          className={`${baseClass} px-4 py-2 text-sm`}
          required={required}
          {...props}
        />
        {success && !error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-success-500 flex items-center justify-center pointer-events-none">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-error-400 mt-1 animate-slide-up">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-neutral-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
