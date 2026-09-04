import axios from 'axios';

const PRIMARY_API_URL = import.meta.env.VITE_CLIENT_API_URL || 'http://localhost:3003/api';
const FALLBACK_API_URL = import.meta.env.VITE_BUSINESS_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: PRIMARY_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to failover to business backend if client backend is not answering (during transition)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config._retry) {
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status === 502) {
      if (config.baseURL === PRIMARY_API_URL && PRIMARY_API_URL !== FALLBACK_API_URL) {
        config._retry = true;
        config.baseURL = FALLBACK_API_URL;
        return axios(config);
      }
    }
    return Promise.reject(error);
  }
);
