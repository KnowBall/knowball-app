import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const lightColors = {
  background: '#fff',
  card: '#f3f4f6',
  text: '#111827',
  primary: '#16a34a',
  secondary: '#2563eb',
  accent: '#f59e42',
  error: '#dc2626',
  border: '#e5e7eb',
  overlay: 'rgba(0,0,0,0.6)',
};

const darkColors = {
  background: '#18181b',
  card: '#27272a',
  text: '#f3f4f6',
  primary: '#22c55e',
  secondary: '#60a5fa',
  accent: '#fbbf24',
  error: '#f87171',
  border: '#3f3f46',
  overlay: 'rgba(0,0,0,0.8)',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [colors, setColors] = useState(lightColors);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('theme');
      if (stored) {
        setTheme(stored);
        setColors(stored === 'dark' ? darkColors : lightColors);
      } else {
        const sys = Appearance.getColorScheme();
        setTheme(sys === 'dark' ? 'dark' : 'light');
        setColors(sys === 'dark' ? darkColors : lightColors);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setColors(newTheme === 'dark' ? darkColors : lightColors);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 