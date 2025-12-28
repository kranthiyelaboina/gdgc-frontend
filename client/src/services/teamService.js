import api from './api';

export const getTeamMembers = async () => {
  try {
    const response = await api.get('/team');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addTeamMember = async (data) => {
  try {
    const response = await api.post('/team', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTeamMember = async (id, data) => {
  try {
    const response = await api.put(`/team/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTeamMember = async (id) => {
  try {
    const response = await api.delete(`/team/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
