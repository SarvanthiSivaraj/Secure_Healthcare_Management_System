// EMR API Integration
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const emrApi = {
    // Consultation
    createConsultation: async (visitId, data) => {
        const response = await axios.post(
            `${API_BASE_URL}/emr/consultation`,
            { visitId, ...data },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Diagnosis
    createDiagnosis: async (visitId, data) => {
        const response = await axios.post(
            `${API_BASE_URL}/emr/diagnosis`,
            { visitId, ...data },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Prescription
    createPrescription: async (visitId, diagnosisId, data) => {
        const response = await axios.post(
            `${API_BASE_URL}/emr/prescription`,
            { visitId, diagnosisId, ...data },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Vitals
    recordVitals: async (visitId, data) => {
        const response = await axios.post(
            `${API_BASE_URL}/emr/vitals`,
            { visitId, ...data },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Lab Results
    uploadLabResults: async (visitId, formData) => {
        const response = await axios.post(
            `${API_BASE_URL}/emr/lab`,
            formData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Imaging
    uploadImagingReport: async (visitId, formData) => {
        const response = await axios.post(
            `${API_BASE_URL}/emr/imaging`,
            formData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Get Patient Records
    getMyRecords: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/emr/patient/records`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get Patient Records (Doctor View)
    getPatientRecords: async (patientId) => {
        const response = await axios.get(
            `${API_BASE_URL}/emr/patient/${patientId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },
};
