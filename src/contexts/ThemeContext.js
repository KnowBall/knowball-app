import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colors = {
    background: isDarkMode ? '#111827' : '#ffffff',
    card: isDarkMode ? '#1f2937' : '#ffffff',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: '#16a34a',
    secondary: '#4b5563',
    accent: '#2563eb',
    error: '#dc2626',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)'
  };

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 