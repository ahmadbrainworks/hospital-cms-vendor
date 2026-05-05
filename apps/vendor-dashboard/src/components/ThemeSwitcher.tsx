"use client";

import { useState, useEffect } from "react";
import { getTheme, applyTheme, type ThemeName } from "@/lib/themes";

const THEMES: { name: ThemeName; label: string; icon: string }[] = [
  { name: "medical-dark", label: "Medical Dark", icon: "🌙" },
  { name: "clinical-light", label: "Clinical Light", icon: "☀️" },
  { name: "modern-glass", label: "Modern Glass", icon: "✨" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("medical-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = getTheme();
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);

  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-theme-surface rounded-lg border border-theme-border">
      {THEMES.map((theme) => (
        <button
          key={theme.name}
          onClick={() => handleThemeChange(theme.name)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            currentTheme === theme.name
              ? "bg-theme-primary text-white shadow-lg"
              : "text-theme-textSecondary hover:bg-theme-border"
          }`}
          title={theme.label}
        >
          <span>{theme.icon}</span>
          <span className="hidden sm:inline">{theme.label}</span>
        </button>
      ))}
    </div>
  );
}
