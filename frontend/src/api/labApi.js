import apiClient from './client';

export const labApi = {
    getAssignedLabTests: async () => {
        try {
            const response = await apiClient.get('/emr/lab/assigned');
            if (response.data.success) {
                return response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching assigned lab tests', error);
            // Mock data fallback if actual backend endpoint doesn't exist
            return [
                {
                    id: 1,
                    patient_id: 101,
                    visit_id: 201,
                    patient_name: 'John Doe',
                    doctor: 'Dr. Smith',
                    test_name: 'Complete Blood Count (CBC)',
                    notes: 'Check for anemia',
                    requested_time: new Date().toISOString(),
                    status: 'pending'
                },
                {
                    id: 2,
                    patient_id: 102,
                    visit_id: 202,
                    patient_name: 'Jane Smith',
                    doctor: 'Dr. Adams',
                    test_name: 'Lipid Panel',
                    notes: 'Routine checkup',
                    requested_time: new Date().toISOString(),
                    status: 'pending'
                }
            ];
        }
    },

    getLabRequestDetails: async (id) => {
        try {
            const response = await apiClient.get(`/emr/lab/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching lab details', error);
            return null;
        }
    },

    uploadLabResult: async (formData) => {
        try {
            // POST /api/emr/lab as per specifications
            const response = await apiClient.post('/emr/lab', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading lab result', error);
            throw error;
        }
    },

    getUploadedResults: async () => {
        try {
            const response = await apiClient.get('/emr/lab/results');
            if (response.data.success) {
                return response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching uploaded results', error);
            // Mock data fallback
            return [
                {
                    id: 1,
                    patient_name: 'Alice Johnson',
                    test_name: 'Thyroid Panel',
                    uploaded_time: new Date().toISOString(),
                    file_url: '#'
                }
            ];
        }
    }
};
