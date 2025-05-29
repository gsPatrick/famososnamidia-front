// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../services/api';
import { Spin } from 'antd'; // <<< IMPORTAR Spin DO antd

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userData = await get('/auth/me');
        setCurrentUser(userData);
      } catch (error) {
        console.error("Falha ao verificar usuário ou token inválido:", error.message || error);
        // Limpar local storage se o token for inválido
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setCurrentUser(null);
      }
    }
    setLoadingAuth(false);
  }, []); // Removido navigate das dependências, pois não é usado diretamente aqui, mas sim em login/logout.


  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    setCurrentUser(userData);

    // Os dados abaixo são redundantes se o Header e outros componentes passarem a usar currentUser do AuthContext
    // Mas podem ser mantidos por enquanto para compatibilidade com código existente que ainda usa localStorage diretamente.
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userRole', userData.role);

    // Adiciona uma pequena mensagem de sucesso de login
    // message.success('Login realizado com sucesso!'); // Movido para LoginPage para feedback imediato

    if (userData.role === 'admin' || userData.role === 'author') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    navigate('/login'); // Redireciona para login após logout.
    // message.success('Logout realizado com sucesso!'); // Pode ser movido para o Header onde o botão é clicado
  };

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isAuthor: currentUser?.role === 'author',
    loadingAuth,
    login,
    logout,
    verifyUser
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Mostra um spinner global enquanto a autenticação inicial está acontecendo */}
      {!loadingAuth ? children : (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            backgroundColor: 'var(--bg-loading-screen, #f0f2f5)' /* Usar variável ou fallback */
        }}>
          <Spin size="large" tip="Carregando aplicação..." />
        </div>
      )}
    </AuthContext.Provider>
  );
};