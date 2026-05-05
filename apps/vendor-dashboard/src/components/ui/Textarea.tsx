"use client";

import { TextareaHTMLAttributes, ReactNode } from "react";
import { inputStyles, cx } from "@/lib/component-utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterLimit?: number;
  required?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  characterLimit,
  value,
  required = false,
  className,
  ...props
}: TextareaProps) {
  const charCount = typeof value === "string" ? value.length : 0;
  const baseClass = cx(
    inputStyles.base,
    inputStyles.border,
    inputStyles.focus,
    inputStyles.disabled,
    inputStyles.transition,
    error && inputStyles.error,
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

      <textarea
        className={`${baseClass} px-4 py-2 text-sm resize-none`}
        value={value}
        required={required}
        {...props}
      />

      <div className="flex items-center justify-between mt-2">
        {error ? (
          <p className="text-xs text-error-400 animate-slide-up">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-neutral-400">
            {helperText}
          </p>
        ) : null}

        {characterLimit && (
          <p
            className={cx(
              "text-xs ml-auto",
              charCount > characterLimit * 0.9
                ? "text-warning-400"
                : "text-neutral-400"
            )}
          >
            {charCount} / {characterLimit}
          </p>
        )}
      </div>
    </div>
  );
}
