import apiClient from './client';

export const userApi = {
    // Get all users (with optional role filter)
    getAllUsers: async (role = null) => {
        const params = role ? { role } : {};
        const response = await apiClient.get('/users', { params });
        return response.data;
    },
    
    // Get doctors
    getDoctors: async () => {
        const response = await apiClient.get('/users', { params: { role: 'DOCTOR' } });
        return response.data;
    },

    // Get nurses
    getNurses: async () => {
        const response = await apiClient.get('/users', { params: { role: 'NURSE' } });
        return response.data;
    }
};

export default userApi;

