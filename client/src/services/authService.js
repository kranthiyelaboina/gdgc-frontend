import api from './api';

export const registerAdmin = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const loginAdmin = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('🔴 loginAdmin error:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    // Extract error message
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message 
      || 'Network error. Please check your connection.';
    
    throw { error: errorMessage, ...error.response?.data };
  }
};

export const logoutAdmin = async () => {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    throw error.response?.data || error;
  }
};

export const getCurrentAdmin = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllAdmins = async () => {
  try {
    const response = await api.get('/auth/admins');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
