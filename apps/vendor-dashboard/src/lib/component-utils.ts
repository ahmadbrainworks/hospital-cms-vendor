/**
 * Component utilities: reusable patterns for interactive elements.
 * Ensures consistency across button, input, and interactive components.
 */

import { getTransition } from "./motion";

/**
 * Base interactive element styles (button, link, clickable)
 */
export const interactiveStyles = {
  base: "cursor-pointer outline-none",
  transition: getTransition(["background-color", "color", "box-shadow"], "micro", "ease_out"),
  focus: "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 focus-visible:ring-offset-neutral-900",
  disabled: "disabled:cursor-not-allowed",
};

/**
 * Button variant styles with animations
 * Includes disabled state to prevent hover effects when disabled
 */
export const buttonVariants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-800 active:scale-95 disabled:bg-neutral-700 disabled:text-neutral-500",
  secondary:
    "bg-neutral-700 text-neutral-100 hover:bg-neutral-600 active:bg-neutral-800 active:scale-95 disabled:bg-neutral-800 disabled:text-neutral-600",
  ghost:
    "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 active:scale-95 disabled:text-neutral-600 disabled:hover:bg-transparent",
  danger:
    "bg-error-600 text-white hover:bg-error-500 active:bg-error-800 active:scale-95 disabled:bg-neutral-700 disabled:text-neutral-500",
  success:
    "bg-success-600 text-white hover:bg-success-500 active:bg-success-800 active:scale-95 disabled:bg-neutral-700 disabled:text-neutral-500",
};

/**
 * Button sizes with consistent vertical rhythm
 * Padding: 4px base unit. py values: 1=4px, 1.5=6px, 2=8px, 2.5=10px, 3=12px
 */
export const buttonSizes = {
  xs: "px-2.5 py-1.5 text-xs font-medium rounded-md gap-1",
  sm: "px-3.5 py-1.5 text-sm font-medium rounded-md gap-1.5",
  md: "px-4 py-2 text-sm font-semibold rounded-lg gap-2",
  lg: "px-6 py-2.5 text-base font-semibold rounded-lg gap-2",
  xl: "px-8 py-3 text-lg font-bold rounded-xl gap-3",
};

/**
 * Input/select focus and error styles
 * Includes success state for validation feedback
 */
export const inputStyles = {
  base: "w-full rounded-lg border bg-neutral-800 text-neutral-100 placeholder-neutral-500 transition-micro",
  border: "border-neutral-700",
  focus: "focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50",
  error: "border-error-600 bg-error-950/20 focus:border-error-500 focus:ring-error-500/50",
  success: "border-success-600 focus:border-success-500 focus:ring-success-500/50",
  disabled: "disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border-neutral-700 disabled:cursor-not-allowed",
  transition: getTransition(["border-color", "box-shadow", "background-color"], "micro", "ease_out"),
};

/**
 * Card hover and interaction styles
 * Lift effect is more visible (8px vs 4px)
 */
export const cardStyles = {
  base: "rounded-xl border border-neutral-700 bg-neutral-800",
  transition: getTransition(["box-shadow", "transform", "border-color"], "standard", "ease_out"),
  hover: "hover:shadow-xl hover:border-neutral-600 hover:-translate-y-2 cursor-pointer",
  interactive: "group transition-all",
};

/**
 * Badge styles (status indicators)
 * Opacity varies by variant for optimal visual balance
 * Info/success/warning: /15 (subtle), Error: /25 (urgent), Primary: /20 (standard)
 */
export const badgeVariants = {
  default: "bg-neutral-700 text-neutral-100 border border-neutral-600",
  primary: "bg-primary-500/20 text-primary-300 border border-primary-500/40",
  success: "bg-success-500/15 text-success-300 border border-success-500/40",
  warning: "bg-warning-500/15 text-warning-300 border border-warning-500/40",
  error: "bg-error-500/25 text-error-300 border border-error-500/50",
  info: "bg-info-500/15 text-info-300 border border-info-500/40",
};

/**
 * Compose class names with transitions
 */
export const cx = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

/**
 * Elevation/shadow system
 */
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "focus-ring": "shadow-[0_0_0_2px_rgba(15,23,42,1),0_0_0_4px_rgba(59,130,246,0.5)]",
};
