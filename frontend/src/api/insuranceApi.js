import axios from 'axios';

const API_BASE = 'http://localhost:5003/api/v1/insurance';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}` };
};

const insuranceApi = {
    getDashboardStats: async () => {
        const res = await axios.get(`${API_BASE}/dashboard`, { headers: getAuthHeaders() });
        return res.data;
    },

    getClaims: async () => {
        const res = await axios.get(`${API_BASE}/claims`, { headers: getAuthHeaders() });
        return res.data;
    },

    updateClaim: async (id, payload) => {
        const res = await axios.put(`${API_BASE}/claims/${id}`, payload, { headers: getAuthHeaders() });
        return res.data;
    },

    verifyCoverage: async (params) => {
        const res = await axios.get(`${API_BASE}/coverage/verify`, { params, headers: getAuthHeaders() });
        return res.data;
    },

    getPolicyholders: async () => {
        const res = await axios.get(`${API_BASE}/policyholders`, { headers: getAuthHeaders() });
        return res.data;
    },

    getProfile: async () => {
        const res = await axios.get(`${API_BASE}/profile`, { headers: getAuthHeaders() });
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await axios.put(`${API_BASE}/profile`, data, { headers: getAuthHeaders() });
        return res.data;
    },
};

export default insuranceApi;
