/**
 * Motion system: easing, timing, and animation definitions.
 * Unified motion language across all components.
 */

export const MOTION = {
  duration: {
    micro: 150,
    standard: 250,
    macro: 400,
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    ease_out: "cubic-bezier(0.0, 0, 0.2, 1)",
    ease_in: "cubic-bezier(0.4, 0, 1, 1)",
    ease_in_out: "cubic-bezier(0.4, 0, 0.2, 1)",
    emphasis: "cubic-bezier(0.3, 0.7, 0.4, 1)",
  },
} as const;

export type MotionVariant = "micro" | "standard" | "macro";
export type EasingVariant = "standard" | "ease_out" | "ease_in" | "ease_in_out" | "emphasis";

export const getTransition = (
  properties: string[] = ["all"],
  variant: MotionVariant = "standard",
  easing: EasingVariant = "ease_out"
) => {
  const duration = MOTION.duration[variant];
  const easingValue = MOTION.easing[easing];
  return properties.map((prop) => `${prop} ${duration}ms ${easingValue}`).join(", ");
};

/**
 * CSS animation definitions for Tailwind utilities
 */
export const animations = {
  "fade-in": "fadeIn 250ms ease-out forwards",
  "fade-out": "fadeOut 200ms ease-in forwards",
  "scale-in": "scaleIn 300ms ease-out forwards",
  "scale-out": "scaleOut 200ms ease-in forwards",
  "slide-up": "slideUp 300ms ease-out forwards",
  "slide-down": "slideDown 300ms ease-out forwards",
  "slide-left": "slideLeft 300ms ease-out forwards",
  "slide-right": "slideRight 300ms ease-out forwards",
  "bounce-in": "bounceIn 400ms cubic-bezier(0.3, 0.7, 0.4, 1) forwards",
  "spin-in": "spinIn 400ms ease-out forwards",
  "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
  "shimmer": "shimmer 2s linear infinite",
  "focus-pulse": "focusPulse 200ms ease-out forwards",
};

/**
 * Keyframe definitions (add to globals.css @keyframes layer)
 */
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes scaleOut {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0.95); opacity: 0; }
  }

  @keyframes slideUp {
    from { transform: translateY(8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideDown {
    from { transform: translateY(-8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideLeft {
    from { transform: translateX(8px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideRight {
    from { transform: translateX(-8px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { opacity: 1; }
    70% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes spinIn {
    from { transform: rotate(-180deg) scale(0.5); opacity: 0; }
    to { transform: rotate(0) scale(1); opacity: 1; }
  }

  @keyframes pulseSubtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes focusPulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
`;
