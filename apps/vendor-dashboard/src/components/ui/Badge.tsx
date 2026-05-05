"use client";

import { ReactNode } from "react";
import { badgeVariants, cx } from "@/lib/component-utils";

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs font-medium rounded-md",
  md: "px-3 py-1.5 text-sm font-medium rounded-lg",
};

export function Badge({
  children,
  variant = "default",
  pulse = false,
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cx(
        badgeVariants[variant],
        sizeClasses[size],
        "inline-flex items-center gap-2 transition-micro",
        pulse && "relative",
        className
      )}
    >
      {pulse && (
        <>
          <span className="flex h-2 w-2 relative">
            <span className="animate-pulse-subtle absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
        </>
      )}
      {children}
    </span>
  );
}
