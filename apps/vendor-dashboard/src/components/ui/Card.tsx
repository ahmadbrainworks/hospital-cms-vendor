"use client";

import { ReactNode } from "react";
import { cardStyles, cx } from "@/lib/component-utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className,
  hoverable = false,
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      className={cx(
        cardStyles.base,
        cardStyles.transition,
        hoverable && cardStyles.hover,
        paddingClasses[padding],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cx("border-b border-neutral-700 pb-4 mb-4", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cx("", className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cx("border-t border-neutral-700 pt-4 mt-4", className)}>
      {children}
    </div>
  );
}
