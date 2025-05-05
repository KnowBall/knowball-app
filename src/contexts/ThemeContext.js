import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const colors = {
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    primary: '#16a34a',
    secondary: '#4b5563',
    accent: '#2563eb',
    error: '#dc2626',
    border: '#374151',
    overlay: 'rgba(0,0,0,0.7)'
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