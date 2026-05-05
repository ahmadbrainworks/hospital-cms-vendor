"use client";

import { ReactNode, useState } from "react";
import { cx } from "@/lib/component-utils";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  children: (tabId: string) => ReactNode;
  defaultTab?: string;
  variant?: "default" | "pills" | "underline";
  onChange?: (tabId: string) => void;
}

export function Tabs({
  tabs,
  children,
  defaultTab,
  variant = "default",
  onChange,
}: TabsProps) {
  const initialTab = defaultTab || tabs[0]?.id || "";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % enabledTabs.length;
      handleTabChange(enabledTabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex =
        currentIndex === 0 ? enabledTabs.length - 1 : currentIndex - 1;
      handleTabChange(enabledTabs[prevIndex].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleTabChange(enabledTabs[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      handleTabChange(enabledTabs[enabledTabs.length - 1].id);
    }
  };

  const variantStyles = {
    default:
      "border-b border-neutral-700 flex gap-1",
    pills: "flex gap-2",
    underline: "flex border-b border-neutral-700 gap-4",
  };

  const tabButtonStyles = {
    default: {
      base: "px-4 py-3 font-medium text-sm transition-micro outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-lg",
      active: "border-b-2 border-primary-500 text-primary-400",
      inactive: "text-neutral-400 hover:text-neutral-200 border-b-2 border-transparent",
    },
    pills: {
      base: "px-4 py-2 font-medium text-sm transition-micro outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg",
      active: "bg-primary-600 text-white",
      inactive: "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
    },
    underline: {
      base: "px-2 py-2 font-medium text-sm transition-micro outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
      active: "text-primary-400 border-b-2 border-primary-500",
      inactive: "text-neutral-400 hover:text-neutral-200 border-b-2 border-transparent",
    },
  };

  const styles = tabButtonStyles[variant];

  return (
    <div>
      <div className={variantStyles[variant]} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={handleKeyDown}
            className={cx(
              styles.base,
              activeTab === tab.id ? styles.active : styles.inactive,
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            disabled={tab.disabled}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 flex-shrink-0">{tab.badge}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div
        id={`${activeTab}-panel`}
        role="tabpanel"
        className="animate-fade-in mt-4"
      >
        {children(activeTab)}
      </div>
    </div>
  );
}
