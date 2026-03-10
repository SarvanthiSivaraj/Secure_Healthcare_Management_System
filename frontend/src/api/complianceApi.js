import axios from 'axios';

const API_URL = 'http://localhost:5003/api/v1/compliance';

export const complianceApi = {
    getDashboardStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboard`);
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance dashboard stats:', error);
            throw error;
        }
    },

    getIncidents: async () => {
        try {
            const response = await axios.get(`${API_URL}/incidents`);
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance incidents:', error);
            throw error;
        }
    },

    updateIncidentStatus: async (id, status) => {
        try {
            const response = await axios.put(`${API_URL}/incidents/${id}`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating incident status:', error);
            throw error;
        }
    },

    getGlobalAudits: async () => {
        try {
            const response = await axios.get(`${API_URL}/global-audits`);
            return response.data;
        } catch (error) {
            console.error('Error fetching global audits:', error);
            throw error;
        }
    },

    getConsentOverrides: async () => {
        try {
            const response = await axios.get(`${API_URL}/consent-overrides`);
            return response.data;
        } catch (error) {
            console.error('Error fetching consent overrides:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await axios.get(`${API_URL}/profile`);
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await axios.put(`${API_URL}/profile`, profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating compliance profile:', error);
            throw error;
        }
    }
};
