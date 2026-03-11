import { emrApi } from '../emrApi';
import apiClient from '../client';

// Mock the apiClient methods
jest.mock('../client', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
    },
}));

describe('emrApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createMedicalRecord', () => {
        it('should call apiClient.post with provided data', async () => {
            const mockResponse = { data: { success: true, id: '123' } };
            apiClient.post.mockResolvedValueOnce(mockResponse);

            const recordData = { patientId: 'p1', visitId: 'v1', type: 'consultation' };
            const result = await emrApi.createMedicalRecord(recordData);

            expect(apiClient.post).toHaveBeenCalledWith('/emr/medical-records', recordData);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getPatientMedicalRecords', () => {
        it('should call apiClient.get with patientId and params', async () => {
            const mockResponse = { data: { success: true, records: [] } };
            apiClient.get.mockResolvedValueOnce(mockResponse);

            const patientId = 'uuid123';
            const result = await emrApi.getPatientMedicalRecords(patientId, { page: 1 });

            expect(apiClient.get).toHaveBeenCalledWith(`/emr/patients/${patientId}/medical-records`, {
                params: { page: 1 }
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('uploadLabResult', () => {
        it('should call apiClient.post with multipart headers', async () => {
            const mockResponse = { data: { success: true } };
            apiClient.post.mockResolvedValueOnce(mockResponse);

            const formData = new FormData();
            formData.append('file', new Blob(['test']), 'test.pdf');

            const result = await emrApi.uploadLabResult(formData);

            expect(apiClient.post).toHaveBeenCalledWith('/emr/lab-results', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            expect(result).toEqual(mockResponse.data);
        });
    });
});
