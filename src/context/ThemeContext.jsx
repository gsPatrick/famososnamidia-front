// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Tenta pegar o tema do localStorage, ou usa 'light' como padrão
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    // Aplica a classe de tema ao body e salva no localStorage
    document.body.className = ''; // Limpa classes anteriores
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};  