// src/components/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spin } from 'antd';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, isLoggedIn, loadingAuth } = useAuth();

  if (loadingAuth) {
    // Exibe um spinner enquanto o estado de autenticação está sendo carregado
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)', background: '#f0f2f5' }}>
        <Spin size="large" tip="Verificando acesso..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    // Redireciona para a página de login se não estiver logado
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    // Redireciona para uma página de "Não Autorizado" ou para a home se o papel não for permitido
    // alert("Você não tem permissão para acessar esta página."); // Alerta simples
    return <Navigate to="/" replace />; // Ou para uma página /unauthorized
  }

  // Se logado e (sem roles específicas OU com role permitido), renderiza o conteúdo da rota
  return <Outlet />;
};

export default ProtectedRoute;