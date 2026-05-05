"use client";

import { ReactNode } from "react";
import { cx } from "@/lib/component-utils";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  divider?: boolean;
}

export function Topbar({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  actions,
  sticky = true,
  divider = true,
}: TopbarProps) {
  return (
    <div
      className={cx(
        "transition-motion",
        sticky && "sticky top-0 z-40",
        divider && "border-b border-neutral-700",
        "bg-neutral-900/95 backdrop-blur-sm"
      )}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {leftSlot && <div className="flex-shrink-0">{leftSlot}</div>}
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-2xl font-bold text-neutral-100 line-clamp-1">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-400 line-clamp-1 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right section */}
          {(actions || rightSlot) && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions && <div>{actions}</div>}
              {rightSlot && <div>{rightSlot}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
