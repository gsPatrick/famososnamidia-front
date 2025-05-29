// src/config/apiConfig.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://geral-famosonamidiaapi.r954jc.easypanel.host/api/v1'; // Ajuste a porta se necessário

// Função para obter o token do localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};