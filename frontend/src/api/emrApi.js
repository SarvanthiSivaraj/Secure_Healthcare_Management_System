// EMR API Integration
import apiClient from './client';

export const emrApi = {
    // Consultation
    createConsultation: async (visitId, data) => {
        const response = await apiClient.post('/emr/consultation', { visitId, ...data });
        return response.data;
    },

    // Diagnosis
    createDiagnosis: async (visitId, data) => {
        const response = await apiClient.post('/emr/diagnosis', { visitId, ...data });
        return response.data;
    },

    // Prescription
    createPrescription: async (visitId, diagnosisId, data) => {
        const response = await apiClient.post('/emr/prescription', { visitId, diagnosisId, ...data });
        return response.data;
    },

    // Vitals
    recordVitals: async (visitId, data) => {
        const response = await apiClient.post('/emr/vitals', { visitId, ...data });
        return response.data;
    },

    // Lab Results
    uploadLabResults: async (visitId, formData) => {
        const response = await apiClient.post('/emr/lab', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Imaging
    uploadImagingReport: async (visitId, formData) => {
        const response = await apiClient.post('/emr/imaging', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get Patient Records (For Patient Dashboard)
    getPatientMedicalRecords: async (patientId) => {
        const response = await apiClient.get(`/emr/patients/${patientId}/medical-records`);
        return response.data;
    },
};

