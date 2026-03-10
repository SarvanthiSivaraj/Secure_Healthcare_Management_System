import apiClient from './client';

export const complianceApi = {
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/compliance/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance dashboard stats:', error);
            throw error;
        }
    },

    getIncidents: async () => {
        try {
            const response = await apiClient.get('/compliance/incidents');
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance incidents:', error);
            throw error;
        }
    },

    updateIncidentStatus: async (id, status) => {
        try {
            const response = await apiClient.put(`/compliance/incidents/${id}`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating incident status:', error);
            throw error;
        }
    },

    getGlobalAudits: async () => {
        try {
            const response = await apiClient.get('/compliance/global-audits');
            return response.data;
        } catch (error) {
            console.error('Error fetching global audits:', error);
            throw error;
        }
    },

    getConsentOverrides: async () => {
        try {
            const response = await apiClient.get('/compliance/consent-overrides');
            return response.data;
        } catch (error) {
            console.error('Error fetching consent overrides:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await apiClient.get('/compliance/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put('/compliance/profile', profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating compliance profile:', error);
            throw error;
        }
    }
};
