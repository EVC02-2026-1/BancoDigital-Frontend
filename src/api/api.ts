import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8081/api',
  baseURL: 'https://bancodigital-backend.onrender.com/api'  
});

// Interceptor to add JWT to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
