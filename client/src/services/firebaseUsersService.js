import api from './api';

/**
 * Firebase Users Service
 * 
 * Handles API calls to manage Firebase authenticated users.
 * These endpoints are protected and require admin authentication.
 */

/**
 * Get all Firebase users
 * @returns {Promise<{success: boolean, count: number, users: Array}>}
 */
export const getFirebaseUsers = async () => {
  try {
    const response = await api.get('/firebase/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching Firebase users:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get a single Firebase user by UID
 * @param {string} uid - Firebase user UID
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export const getFirebaseUserByUid = async (uid) => {
  try {
    const response = await api.get(`/firebase/users/${uid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Firebase user:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a Firebase user
 * @param {string} uid - Firebase user UID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteFirebaseUser = async (uid) => {
  try {
    const response = await api.delete(`/firebase/users/${uid}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting Firebase user:', error);
    throw error.response?.data || error;
  }
};

/**
 * Enable or disable a Firebase user
 * @param {string} uid - Firebase user UID
 * @param {boolean} disabled - Whether to disable the user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateFirebaseUserStatus = async (uid, disabled) => {
  try {
    const response = await api.patch(`/firebase/users/${uid}/status`, { disabled });
    return response.data;
  } catch (error) {
    console.error('Error updating Firebase user status:', error);
    throw error.response?.data || error;
  }
};
