import api from './api';

export const sendContactMessage = async (data) => {
  try {
    const response = await api.post('/contact', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
