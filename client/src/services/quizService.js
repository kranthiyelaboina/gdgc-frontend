import api from './api';

export const validateQuizCode = async (code) => {
  try {
    const response = await api.get(`/quiz/validate/${code}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const startQuiz = async (data) => {
  try {
    const response = await api.post('/quiz/start', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuizQuestions = async (quizId) => {
  try {
    const response = await api.get(`/quiz/${quizId}/questions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitQuiz = async (data) => {
  try {
    const response = await api.post('/quiz/submit', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createQuiz = async (data) => {
  try {
    const response = await api.post('/quiz/create', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllQuizzes = async () => {
  try {
    const response = await api.get('/quiz/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllQuizzesAdmin = async () => {
  try {
    const response = await api.get('/quiz/admin/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuizAttempts = async (params = {}) => {
  try {
    const response = await api.get('/quiz/admin/attempts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserQuizHistory = async (userId) => {
  try {
    const response = await api.get(`/quiz/admin/user/${userId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleQuizStatus = async (id) => {
  try {
    const response = await api.patch(`/quiz/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuiz = async (id, data) => {
  try {
    const response = await api.put(`/quiz/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteQuiz = async (id) => {
  try {
    const response = await api.delete(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuizStatus = async (id, status) => {
  try {
    const response = await api.patch(`/quiz/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setQuizAdmin = async (quizId, adminData) => {
  try {
    const response = await api.post(`/quiz/${quizId}/admin`, adminData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeQuizAdmin = async (quizId, userId) => {
  try {
    const response = await api.delete(`/quiz/${quizId}/admin/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuizAdmins = async (quizId) => {
  try {
    const response = await api.get(`/quiz/${quizId}/admins`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkIsQuizAdmin = async (quizCode, rollNumber) => {
  try {
    const response = await api.get(`/quiz/check-admin/${quizCode}/${rollNumber}`);
    return response.data;
  } catch (error) {
    // If 404 or admin check fails, return not admin
    if (error.response?.status === 404 || error.response?.status === 400) {
      return { isAdmin: false };
    }
    throw error.response?.data || error;
  }
};

export const setQuizAdmins = async (quizId, admins) => {
  try {
    const response = await api.patch(`/quiz/${quizId}/admins`, { admins });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkQuizAdmin = async (code, rollNumber) => {
  try {
    const response = await api.get(`/quiz/check-admin/${code}`, {
      params: { rollNumber }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateLiveSettings = async (quizId, liveSettings) => {
  try {
    const response = await api.patch(`/quiz/${quizId}/live-settings`, { liveSettings });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSessionStatus = async (sessionCode) => {
  try {
    const response = await api.get(`/quiz/session/${sessionCode}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSessionResults = async (sessionId) => {
  try {
    const response = await api.get(`/quiz/sessions/${sessionId}/results`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdminSessions = async () => {
  try {
    const response = await api.get('/quiz/admin/sessions');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStudentSessions = async (oderId) => {
  try {
    const response = await api.get(`/quiz/student/${oderId}/sessions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
