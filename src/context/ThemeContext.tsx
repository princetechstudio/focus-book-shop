import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('focus-theme-v2') === 'dark';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    try {
      localStorage.setItem('focus-theme-v2', darkMode ? 'dark' : 'light');
    } catch {
      // Theme remains available for the current session if storage is disabled.
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme: () => setDarkMode(current => !current) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}