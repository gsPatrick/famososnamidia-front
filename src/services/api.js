// src/services/api.js
import axios from 'axios';

// Defina a URL base da sua API.
// Para Vite, as variáveis de ambiente devem começar com VITE_
// e são acessadas via import.meta.env.VITE_NOMBRE_VARIABLE
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://geral-famosonamidiaapi.r954jc.easypanel.host/api/v1'; // Ajuste a porta se necessário
// console.log('API Base URL:', API_BASE_URL); // Para depuração

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT às requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta (opcional, mas útil)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Você pode adicionar tratamento de erro global aqui, como para erros 401
    if (error.response && error.response.status === 401) {
      // Exemplo: Deslogar usuário ou redirecionar para login se token expirar
      // Isso deve ser feito com cuidado para não interferir no AuthContext
      // O AuthContext já tem uma lógica para lidar com falha na verificação do token
      console.warn("API Interceptor: Erro 401 (Não autorizado ou token expirado). O AuthContext deve tratar o logout.");
      // Se o AuthContext não estiver tratando, você pode forçar aqui:
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('userEmail');
      // localStorage.removeItem('userName');
      // localStorage.removeItem('userRole');
      // if (window.location.pathname !== '/login') { // Evita loop de redirect
      //    window.location.href = '/login';
      // }
    }
    // Rejeita a promessa com o erro para que possa ser tratado localmente na chamada da API
    // As funções helper (get, post, put, del) já pegam error.response.data
    return Promise.reject(error);
  }
);


// Funções genéricas de API

// GET
export const get = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    // Se o erro já tem uma mensagem da API (ex: validação), use-a.
    // Senão, use a mensagem genérica do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`API GET Error ${endpoint}:`, errorMessage, error.response?.data);
    // Lança um erro que pode ser pego pelo .catch() na chamada do serviço/componente
    // Inclui o objeto de erro completo para mais detalhes, se disponível
    throw { message: errorMessage, status: error.response?.status, data: error.response?.data, originalError: error };
  }
};

// POST
export const post = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`API POST Error ${endpoint}:`, errorMessage, error.response?.data);
    throw { message: errorMessage, status: error.response?.status, data: error.response?.data, originalError: error };
  }
};

// PUT
export const put = async (endpoint, data) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`API PUT Error ${endpoint}:`, errorMessage, error.response?.data);
    throw { message: errorMessage, status: error.response?.status, data: error.response?.data, originalError: error };
  }
};

// DELETE
export const del = async (endpoint) => { // 'delete' é uma palavra reservada
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`API DELETE Error ${endpoint}:`, errorMessage, error.response?.data);
    throw { message: errorMessage, status: error.response?.status, data: error.response?.data, originalError: error };
  }
};

// Exporta a instância configurada se precisar de acesso direto em algum caso raro
export default apiClient;