import apiClient from './client';

export const nurseApi = {
    // Get dashboard statistics for the nurse
    getDashboardStats: async () => {
        const response = await apiClient.get('/nurse/stats');
        return response.data;
    }
};

export default nurseApi;
