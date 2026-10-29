import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved !== 'light'; // default to dark if not light
  });

  const applyTheme = useCallback((dark) => {
    if (dark) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('app_theme', 'light');
    }
  }, []);

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode, applyTheme]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Ensure theme is applied on initial load (in case body classes not set yet)
  useEffect(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark') {
      setIsDarkMode(true);
    } else if (saved === 'light') {
      setIsDarkMode(false);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
