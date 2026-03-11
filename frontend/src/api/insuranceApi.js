import axios from 'axios';

import { getAuthHeader } from '../utils/tokenManager';

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/v1/insurance`;

const insuranceApi = {
    getDashboardStats: async () => {
        const res = await axios.get(`${API_BASE}/dashboard`, { headers: getAuthHeader() });
        return res.data;
    },

    getClaims: async () => {
        const res = await axios.get(`${API_BASE}/claims`, { headers: getAuthHeader() });
        return res.data;
    },

    updateClaim: async (id, payload) => {
        const res = await axios.put(`${API_BASE}/claims/${id}`, payload, { headers: getAuthHeader() });
        return res.data;
    },

    verifyCoverage: async (params) => {
        const res = await axios.get(`${API_BASE}/coverage/verify`, { params, headers: getAuthHeader() });
        return res.data;
    },

    getPolicyholders: async () => {
        const res = await axios.get(`${API_BASE}/policyholders`, { headers: getAuthHeader() });
        return res.data;
    },

    getProfile: async () => {
        const res = await axios.get(`${API_BASE}/profile`, { headers: getAuthHeader() });
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await axios.put(`${API_BASE}/profile`, data, { headers: getAuthHeader() });
        return res.data;
    },
};

export default insuranceApi;
