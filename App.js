import React from 'react';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </ThemeProvider>
  );
}
