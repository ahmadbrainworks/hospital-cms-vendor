"use client";

import { SelectHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { inputStyles, cx } from "@/lib/component-utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
}

export function Select({
  label,
  options,
  error,
  helperText,
  placeholder,
  required = false,
  className,
  ...props
}: SelectProps) {
  const baseClass = cx(
    inputStyles.base,
    inputStyles.border,
    inputStyles.focus,
    inputStyles.disabled,
    inputStyles.transition,
    error && inputStyles.error,
    "appearance-none pr-12",
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
        <select
          className={`${baseClass} px-4 py-2 text-sm`}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-5 h-5"
          size={18}
        />
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
