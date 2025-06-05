// src/config.js

// Hardcode os valores aqui se você não pode usar .env para import.meta.env
const APP_CONFIG = {
  // URL base para as chamadas de API (ex: /auth, /posts)
  API_URL: 'https://geral-famosonamidiaapi.r954jc.easypanel.host/api/v1',

  // URL base para construir os links completos das imagens
  // Esta é a variável que você usará no lugar de import.meta.env.VITE_API_BASE_URL_FOR_IMAGES
  // O nome da chave aqui pode ser o que você quiser, por exemplo:
  IMAGES_DOMAIN_BASE_URL: 'https://geral-famosonamidiaapi.r954jc.easypanel.host'
  // Ou, para manter o nome similar ao que você tinha no .env:
  // APP_IMAGES_BASE_URL: 'https://geral-famosonamidiaapi.r954jc.easypanel.host'
};

export default APP_CONFIG;