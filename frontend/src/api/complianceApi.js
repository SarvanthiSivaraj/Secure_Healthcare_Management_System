import axios from 'axios';

import { getAuthHeader } from '../utils/tokenManager';
const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/v1/compliance`;

export const complianceApi = {
    getDashboardStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboard`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance dashboard stats:', error);
            throw error;
        }
    },

    getIncidents: async () => {
        try {
            const response = await axios.get(`${API_URL}/incidents`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance incidents:', error);
            throw error;
        }
    },

    updateIncidentStatus: async (id, status) => {
        try {
            const response = await axios.put(`${API_URL}/incidents/${id}`, { status }, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error updating incident status:', error);
            throw error;
        }
    },

    getGlobalAudits: async () => {
        try {
            const response = await axios.get(`${API_URL}/global-audits`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error fetching global audits:', error);
            throw error;
        }
    },

    getConsentOverrides: async () => {
        try {
            const response = await axios.get(`${API_URL}/consent-overrides`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error fetching consent overrides:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await axios.get(`${API_URL}/profile`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await axios.put(`${API_URL}/profile`, profileData, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.error('Error updating compliance profile:', error);
            throw error;
        }
    }
};
