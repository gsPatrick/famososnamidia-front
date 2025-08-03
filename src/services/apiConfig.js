// src/config/apiConfig.js

// <<< CORREÇÃO APLICADA AQUI >>>
// A URL base da API estava duplicada. Agora está correta.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://geral-famososonamidiaapi.r954jc.easypanel.host/api/v1';

// Função para obter o token do localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};