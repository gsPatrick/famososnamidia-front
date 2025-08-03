// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <<< Importe o BrowserRouter aqui
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css'; // ou seu arquivo de estilos global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Este é o ÚNICO roteador da sua aplicação */}
    <BrowserRouter>
      {/* Os provedores envolvem o App, dando contexto a toda a aplicação */}
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);