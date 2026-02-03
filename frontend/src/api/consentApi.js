import apiClient from './authApi';
export const consentApi = {
    // Get all active consents for current patient
    getActiveConsents: async () => {
        const response = await apiClient.get('/consent/active');
        return response.data;
    },
    // Get consent history
    getConsentHistory: async () => {
        const response = await apiClient.get('/consent/history');
        return response.data;
    },
    // Grant new consent
    grantConsent: async (consentData) => {
        const response = await apiClient.post('/consent/grant', consentData);
        return response.data;
    },
    // Revoke consent
    revokeConsent: async (consentId) => {
        const response = await apiClient.put(`/consent/revoke/${consentId}`);
        return response.data;
    },
    // Get available doctors for consent
    getAvailableDoctors: async () => {
        const response = await apiClient.get('/users/doctors');
        return response.data;
    },
};