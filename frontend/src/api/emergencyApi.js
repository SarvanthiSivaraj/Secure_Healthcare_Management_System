// Emergency Access API Integration
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const emergencyApi = {
    // Activate Emergency Mode
    activate: async (justification) => {
        const response = await axios.post(
            `${API_BASE_URL}/emergency/activate`,
            { justification },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Deactivate Emergency Mode
    deactivate: async () => {
        const response = await axios.post(
            `${API_BASE_URL}/emergency/deactivate`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get Emergency Status
    getStatus: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/emergency/status`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get Emergency Access History
    getHistory: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/emergency/history`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },
};
