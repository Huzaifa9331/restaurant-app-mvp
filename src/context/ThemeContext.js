import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { lightColors, darkColors } from '../data/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);
  const value = useMemo(() => ({ isDark, toggleTheme, colors: isDark ? darkColors : lightColors }), [isDark, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a <ThemeProvider>. Wrap your app in it in App.js.');
  return ctx;
}
