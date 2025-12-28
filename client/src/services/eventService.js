import api from './api';

export const getAllEvents = async (filters = {}) => {
  try {
    const response = await api.get('/events', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createEvent = async (data) => {
  try {
    const response = await api.post('/events', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateEvent = async (id, data) => {
  try {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
