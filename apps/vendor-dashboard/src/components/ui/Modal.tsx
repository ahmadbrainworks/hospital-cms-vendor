"use client";

import { ReactNode, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = "md",
  closeOnEscape = true,
  closeOnBackdropClick = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap: restore focus when modal closes
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling: close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
      }}
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-scale-in rounded-xl border border-neutral-700 bg-neutral-800 transition-motion`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-700 px-6 py-4 flex-shrink-0">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-neutral-100"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-400 transition-micro hover:bg-neutral-700 hover:text-neutral-100 focus-ring"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-shrink-0 items-center gap-3 border-t border-neutral-700 justify-end px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
