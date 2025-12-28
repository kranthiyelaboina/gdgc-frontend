import api from './api';

export const getLeaderboard = async (params = {}) => {
  try {
    const response = await api.get('/leaderboard', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateLeaderboard = async (data) => {
  try {
    const response = await api.post('/leaderboard/update', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
