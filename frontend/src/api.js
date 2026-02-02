import axios from 'axios';

// Backend IP Configuration
export const API_BASE_URL = "http://43.205.93.29:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
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
