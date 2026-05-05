"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "@/lib/component-utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  indeterminate?: boolean;
}

export function Checkbox({
  label,
  helperText,
  indeterminate = false,
  className,
  id,
  ...props
}: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group min-h-11">
      <div className="flex items-center h-11 pt-1.5">
        <input
          id={id}
          type="checkbox"
          className="hidden"
          {...props}
        />
        <div
          className={cx(
            "w-5 h-5 rounded border-2 border-neutral-600 bg-neutral-800 transition-micro flex items-center justify-center flex-shrink-0",
            props.checked
              ? "border-primary-500 bg-primary-600"
              : "group-hover:border-neutral-500",
            props.disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {(props.checked || indeterminate) && (
            <Check size={16} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>

      {label && (
        <div className="flex-1 text-sm pt-1.5">
          <span
            className={cx(
              "block font-medium text-neutral-300",
              props.disabled && "opacity-50"
            )}
          >
            {label}
          </span>
          {helperText && (
            <p className="text-xs text-neutral-400 mt-1">
              {helperText}
            </p>
          )}
        </div>
      )}
    </label>
  );
}
