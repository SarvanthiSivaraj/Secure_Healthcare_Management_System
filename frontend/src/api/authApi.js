import apiClient from './client';

// Auth API functions
export const authApi = {
    // Patient registration
    registerPatient: async (data) => {
        const response = await apiClient.post('/auth/register/patient', data);
        return response.data;
    },
    // Doctor registration
    registerDoctor: async (data) => {
        const response = await apiClient.post('/auth/register/doctor', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    // Organization registration
    registerOrganization: async (data) => {
        const response = await apiClient.post('/auth/register/organization', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    // Verify OTP
    verifyOTP: async (email, otp) => {
        const response = await apiClient.post('/auth/otp/verify', { email, otp });
        return response.data;
    },
    // Login
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { emailOrPhone: email, password });
        return response.data;
    },
    // Logout
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
    // Verify Token
    verify: async () => {
        const response = await apiClient.get('/auth/verify');
        return response.data;
    },
};

export default apiClient;