// Visit API Client - Epic 3: Visit Management
import apiClient from './client';

export const visitApi = {
    // Patient: Create a new visit (Request to join hospital)
    createVisit: async (visitData) => {
        const response = await apiClient.post('/visits/request', visitData);
        return response.data;
    },

    // Admin/Staff: Get hospital visits
    getHospitalVisits: async (status = null) => {
        const params = status ? { status } : {};
        const response = await apiClient.get('/visits/hospital', { params });
        return response.data;
    },

    // Admin/Staff: Update visit (Assign staff, change status)
    updateVisit: async (visitId, updateData) => {
        const response = await apiClient.patch(`/visits/${visitId}/assign`, updateData);
        return response.data;
    },

    // Admin: Approve visit and assign doctor/nurse (generates OTP)
    approveVisit: async (visitId, doctorId, nurseId = null) => {
        const response = await apiClient.post(`/visits/${visitId}/approve`, {
            doctorId,
            nurseId
        });
        return response.data;
    },

    // Patient: Verify OTP with access level selection
    verifyVisitOTP: async (visitId, otp, accessLevel) => {
        const response = await apiClient.post(`/visits/${visitId}/verify-otp`, {
            otp,
            accessLevel
        });
        return response.data;
    }
};

export default visitApi;

