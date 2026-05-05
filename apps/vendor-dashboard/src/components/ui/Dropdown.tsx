"use client";

import { ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { cx } from "@/lib/component-utils";

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  width = "w-48",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const enabledItems = items.filter((item) => !item.disabled);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < enabledItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : enabledItems.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && enabledItems[focusedIndex]) {
          handleItemClick(enabledItems[focusedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    },
    [isOpen, focusedIndex, enabledItems]
  );

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const alignmentClass = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setFocusedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 rounded transition-micro"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cx(
            "absolute top-full mt-2 z-50 rounded-lg border border-neutral-700 bg-neutral-800 shadow-lg animate-slide-down",
            width,
            alignmentClass
          )}
          role="menu"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div key={item.id}>
                {item.divider && index > 0 && (
                  <div className="border-t border-neutral-700 my-1" />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  onKeyDown={handleKeyDown}
                  ref={(el) => {
                    if (enabledItems.indexOf(item) === focusedIndex && el) {
                      el.focus();
                    }
                  }}
                  className={cx(
                    "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-micro outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 focus-visible:ring-offset-neutral-800",
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : item.variant === "danger"
                        ? "text-error-400 hover:bg-error-600/20"
                        : "text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100"
                  )}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
