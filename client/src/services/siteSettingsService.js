import api from './api';

/**
 * @returns {Promise<boolean>} 
 */
export const getStudyJamsVisibility = async () => {
    try {
        const response = await api.get('/admin/studyjams-visibility');
        return response.data?.visible ?? true;
    } catch (error) {
        console.error('Error fetching Study Jams visibility:', error);
    
        return true;
    }
};

/**
 * @param {boolean} visible 
 * @returns {Promise<Object>} 
 */
export const setStudyJamsVisibility = async (visible) => {
    try {
        console.log('📤 Setting Study Jams visibility to:', visible);
        const response = await api.post('/admin/studyjams-visibility', { visible });
        console.log('✅ Study Jams visibility response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error setting Study Jams visibility:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        throw error;
    }
};

export default {
    getStudyJamsVisibility,
    setStudyJamsVisibility
};
