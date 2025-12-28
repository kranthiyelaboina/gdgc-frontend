import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for Render.com cold starts and slower connections
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      method: response.config.method,
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    const originalRequest = error.config;
    
    // Don't retry or redirect for login/register/refresh endpoints
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                           originalRequest?.url?.includes('/auth/register') ||
                           originalRequest?.url?.includes('/auth/refresh-token') ||
                           originalRequest?.url?.includes('/auth/me');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, don't try to refresh, just reject
        return Promise.reject(error);
      }
      
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { token: newToken } = response.data;
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // DON'T automatically remove token or redirect here
        // Let the calling code handle authentication failures
        // This prevents race conditions during page navigation
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
