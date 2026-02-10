// Visit API Client - Epic 3: Visit Management
import apiClient from './client';

export const visitApi = {
    // Patient: Create a new visit (Request to join hospital)
    createVisit: async (visitData) => {
        const response = await apiClient.post('/visits/request', visitData);
        return response.data;
    },

    // Patient: Get my visits
    getMyVisits: async () => {
        const response = await apiClient.get('/visits/my-visits');
        const visits = response.data.visits || response.data || [];

        // Transform snake_case backend data to camelCase for frontend
        return visits.map(visit => ({
            ...visit,
            doctorName: visit.doctor_first_name && visit.doctor_last_name
                ? `${visit.doctor_first_name} ${visit.doctor_last_name}`
                : 'Unassigned',
            nurseName: visit.nurse_first_name && visit.nurse_last_name
                ? `${visit.nurse_first_name} ${visit.nurse_last_name}`
                : null,
            patientName: visit.patient_first_name && visit.patient_last_name
                ? `${visit.patient_first_name} ${visit.patient_last_name}`
                : null,
            scheduledTime: visit.scheduled_time,
            visitCode: visit.visit_code,
            visitType: visit.reason || visit.visit_type,
            organizationName: visit.organization_name
        }));
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
    approveVisit: async (visitId, doctorId, nurseId = null, scheduledTime = null) => {
        const response = await apiClient.post(`/visits/${visitId}/approve`, {
            doctorId,
            nurseId,
            scheduledTime
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
    },

    // Patient: Check in with code (Smart wrapper)
    checkIn: async (otp) => {
        // 1. Get my visits (returns transformed data with camelCase)
        const visits = await visitApi.getMyVisits();

        // 2. Find the visit that is in 'approved' state
        const readyVisit = visits.find(v => v.status === 'approved');

        if (!readyVisit) {
            throw new Error('No approved visit found to check in to. Please request a visit or wait for approval.');
        }

        // 3. Verify OTP for that visit
        // Defaulting accessLevel to 'read' for simple check-in
        return await visitApi.verifyVisitOTP(readyVisit.id, otp, 'read');
    }
};

export default visitApi;

