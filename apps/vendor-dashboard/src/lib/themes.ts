// Hospital-grade theme system with 3 switchable themes

export type ThemeName = 'medical-dark' | 'clinical-light' | 'modern-glass';

export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  glow: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  'medical-dark': {
    bg: '#0a1929', // Deep navy
    surface: '#132f4c', // Medical blue-gray
    border: '#1a3a52',
    text: '#e8f0ff',
    textSecondary: '#a8c5dd',
    primary: '#0288d1', // Clean medical blue
    primaryLight: '#03a9f4',
    secondary: '#26a69a', // Healing green
    accent: '#00bcd4', // Sky cyan
    success: '#10b981', // Health green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Clinical red
    glow: 'rgba(2, 136, 209, 0.2)',
  },
  'clinical-light': {
    bg: '#ffffff',
    surface: '#f8fafb',
    border: '#e5e7eb',
    text: '#0a1929',
    textSecondary: '#4b5563',
    primary: '#0288d1',
    primaryLight: '#29b6f6',
    secondary: '#26a69a',
    accent: '#00bcd4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glow: 'rgba(2, 136, 209, 0.1)',
  },
  'modern-glass': {
    bg: '#0f1419', // Charcoal
    surface: 'rgba(19, 47, 76, 0.7)', // Semi-transparent medical blue
    border: 'rgba(2, 136, 209, 0.3)',
    text: '#e8f0ff',
    textSecondary: '#a8c5dd',
    primary: '#0288d1',
    primaryLight: '#03a9f4',
    secondary: '#26a69a',
    accent: '#00bcd4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glow: 'rgba(2, 136, 209, 0.4)',
  },
};

export function applyTheme(themeName: ThemeName) {
  const theme = themes[themeName];
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });

  localStorage.setItem('hospital-cms-theme', themeName);
}

export function getTheme(): ThemeName {
  if (typeof window === 'undefined') return 'medical-dark';
  return (localStorage.getItem('hospital-cms-theme') as ThemeName) || 'medical-dark';
}
