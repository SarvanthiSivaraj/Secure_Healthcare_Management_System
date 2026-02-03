// Visit API Client - Epic 3: Visit Management
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const visitApi = {
    // Patient: Create a new visit
    createVisit: async (visitData) => {
        const response = await apiClient.post('/visits', visitData);
        return response.data;
    },

    // Patient: Check in with visit code
    checkIn: async (visitCode) => {
        const response = await apiClient.post('/visits/check-in', { visitCode });
        return response.data;
    },

    // Patient: Get my visits
    getMyVisits: async (status = null) => {
        const params = status ? { status } : {};
        const response = await apiClient.get('/visits/my-visits', { params });
        return response.data;
    },

    // Staff: Get today's visits
    getTodayVisits: async () => {
        const response = await apiClient.get('/visits/today');
        return response.data;
    },

    // Doctor: Get active visits
    getActiveVisits: async () => {
        const response = await apiClient.get('/visits/active');
        return response.data;
    },

    // Staff: Activate a visit
    activateVisit: async (visitId) => {
        const response = await apiClient.post(`/visits/${visitId}/activate`);
        return response.data;
    },

    // Doctor/Staff: Close a visit
    closeVisit: async (visitId, notes = '') => {
        const response = await apiClient.post(`/visits/${visitId}/close`, { notes });
        return response.data;
    },

    // Get visit details
    getVisitDetails: async (visitId) => {
        const response = await apiClient.get(`/visits/${visitId}`);
        return response.data;
    },

    // Staff: Assign staff to visit
    assignStaff: async (visitId, staffId) => {
        const response = await apiClient.post(`/visits/${visitId}/assign-staff`, { staffId });
        return response.data;
    },

    // Get visit history
    getVisitHistory: async (patientId) => {
        const response = await apiClient.get(`/visits/history/${patientId}`);
        return response.data;
    },
};

export default visitApi;
