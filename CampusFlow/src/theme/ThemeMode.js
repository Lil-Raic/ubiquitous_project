import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#0F52BA', 
  background: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
};

export const darkColors = {
  primary: '#1E3A8A', 
  background: '#111827', 
  surface: '#1F2937', 
  text: '#F9FAFB', 
  textLight: '#9CA3AF',
  border: '#374151',
};

export const ThemeMode = createContext();


export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme(); 
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeMode.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeMode.Provider>
  );
}; 

export const useThemeStyles = (styleCreator) => {
  const { colors, isDarkMode } = useContext(ThemeMode);
  return styleCreator(colors, isDarkMode);
};