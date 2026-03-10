import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api/v1';

// Create an Axios instance for researcher API calls
const apiClient = axios.create({
    baseURL: `${API_URL}/research`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                if (userObj.accessToken) {
                    config.headers.Authorization = `Bearer ${userObj.accessToken}`;
                }
            } catch (error) {
                console.error("Error parsing user from local storage", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const researchApi = {
    // Analytics Dashboard
    getStats: async () => {
        const response = await apiClient.get('/stats');
        return response.data;
    },

    // Detailed Data Explorer Views
    getSymptoms: async () => {
        const response = await apiClient.get('/symptoms');
        return response.data;
    },

    getTreatments: async () => {
        const response = await apiClient.get('/treatments');
        return response.data;
    },

    getDemographics: async () => {
        const response = await apiClient.get('/demographics');
        return response.data;
    },

    // Researcher Profile
    getProfile: async () => {
        const response = await apiClient.get('/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await apiClient.put('/profile', profileData);
        return response.data;
    }
};
