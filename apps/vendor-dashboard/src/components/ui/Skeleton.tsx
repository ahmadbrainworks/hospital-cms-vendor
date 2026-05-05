"use client";

import { cx } from "@/lib/component-utils";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "text" | "circle" | "rect";
}

export function Skeleton({
  width,
  height = "1rem",
  className,
  variant = "rect",
}: SkeletonProps) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cx(
        "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-shimmer",
        variant === "circle" && "rounded-full",
        variant === "rect" && "rounded-lg",
        variant === "text" && "rounded",
        className
      )}
      style={{
        width: widthStyle,
        height: heightStyle,
        backgroundSize: "200% 100%",
      }}
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  className?: string;
  children?: (index: number) => React.ReactNode;
}

export function SkeletonGroup({
  count = 3,
  className,
  children,
}: SkeletonGroupProps) {
  return (
    <div className={cx("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) =>
        children ? (
          <div key={i}>{children(i)}</div>
        ) : (
          <Skeleton key={i} />
        )
      )}
    </div>
  );
}
