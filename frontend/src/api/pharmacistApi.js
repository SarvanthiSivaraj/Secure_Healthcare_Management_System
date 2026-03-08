import axios from 'axios';

const API_URL = 'http://localhost:5003/api/v1';

// We use the same mock token structure as the rest of the app 
// to ensure the backend recognizes the session.
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    let token = '';
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // The backend mock currently accepts any string or the specific mock token
            // In a real app, you'd store tracking tokens securely. 
            // We use standard Bearer for the mock.
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...mock';
        } catch(e) { console.error('Error parsing user data:', e); }
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const pharmacistApi = {
    getDashboardStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/pharmacist/stats`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('API Error: getDashboardStats', error);
            throw error;
        }
    },

    getPrescriptions: async (status = 'all') => {
        try {
            const response = await axios.get(`${API_URL}/pharmacist/prescriptions`, { 
                headers: getAuthHeaders(),
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error('API Error: getPrescriptions', error);
            throw error;
        }
    },

    dispensePrescription: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/pharmacist/prescriptions/${id}/dispense`, {}, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('API Error: dispensePrescription', error);
            throw error;
        }
    },

    getInventory: async () => {
        try {
            const response = await axios.get(`${API_URL}/pharmacist/inventory`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('API Error: getInventory', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await axios.get(`${API_URL}/pharmacist/profile`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('API Error: getProfile', error);
            throw error;
        }
    },

    updateProfile: async (data) => {
        try {
            const response = await axios.put(`${API_URL}/pharmacist/profile`, data, { headers: getAuthHeaders() });
             return response.data;
        } catch (error) {
            console.error('API Error: updateProfile', error);
            throw error;
        }
    },

    getAuditLogs: async () => {
        try {
            const response = await axios.get(`${API_URL}/pharmacist/audit-logs`, { headers: getAuthHeaders() });
             return response.data;
        } catch (error) {
            console.error('API Error: getAuditLogs', error);
            throw error;
        }
    }
};
