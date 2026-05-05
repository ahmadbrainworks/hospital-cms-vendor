"use client";

import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { cx } from "@/lib/component-utils";

interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onNavigate?: (itemId: string) => void;
}

export function Sidebar({
  items,
  title,
  collapsible = true,
  defaultCollapsed = false,
  onNavigate,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children) {
      toggleExpanded(item.id);
    }
    item.onClick?.();
    onNavigate?.(item.id);
  };

  return (
    <>
      {/* Mobile menu button (hidden on desktop) */}
      {collapsible && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden sm:flex absolute top-4 left-4 items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-500 outline-none transition-micro md:hidden"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      )}

      {/* Backdrop for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden transition-opacity animate-fade-in z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cx(
          "fixed left-0 top-0 h-screen overflow-y-auto transition-motion z-50 md:z-0",
          "border-r border-neutral-700 bg-neutral-900",
          "md:relative md:w-64 md:translate-x-0",
          isCollapsed ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        {title && (
          <div className="border-b border-neutral-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={cx(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-micro outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  item.active
                    ? "bg-primary-600/20 text-primary-300 border border-primary-500/30"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {item.children && (
                  <span
                    className={cx(
                      "transform transition-transform",
                      expandedItems.has(item.id) ? "rotate-180" : ""
                    )}
                  >
                    ▼
                  </span>
                )}
              </button>

              {/* Submenu */}
              {item.children && expandedItems.has(item.id) && (
                <div className="mt-1 ml-4 border-l-2 border-neutral-700 pl-4 py-1 space-y-1 animate-slide-down">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleItemClick(child)}
                      className={cx(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-micro outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                        child.active
                          ? "bg-primary-600/20 text-primary-300 border-l-2 border-primary-500 pl-3"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300"
                      )}
                    >
                      {child.icon && (
                        <span className="flex-shrink-0">{child.icon}</span>
                      )}
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
