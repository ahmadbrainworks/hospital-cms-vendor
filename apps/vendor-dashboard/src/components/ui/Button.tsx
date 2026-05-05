"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { buttonVariants, buttonSizes, cx } from "@/lib/component-utils";

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  icon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-micro outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 focus-visible:ring-offset-neutral-900 active:scale-95";

  const sizeStyle = buttonSizes[size];
  const variantStyle = buttonVariants[variant];

  return (
    <button
      className={cx(
        baseStyles,
        sizeStyle,
        variantStyle,
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
