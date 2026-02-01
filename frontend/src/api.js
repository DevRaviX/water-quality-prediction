import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const predictWaterQuality = async (data) => {
    try {
        const response = await api.post('/predict', data);
        return response.data;
    } catch (error) {
        console.error('Prediction failed:', error);
        throw error;
    }
};

export const getModelStats = async () => {
    try {
        const response = await api.get('/stats');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        throw error;
    }
};

export const getRandomSample = async () => {
    try {
        const response = await api.get('/sample');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch sample:', error);
        // Fallback? or throw
        throw error;
    }
};

export default api;
