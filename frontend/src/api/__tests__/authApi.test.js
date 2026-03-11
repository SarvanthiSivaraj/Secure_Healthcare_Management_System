import { authApi } from '../authApi';
import apiClient from '../client';

// Mock the apiClient methods
jest.mock('../client', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        get: jest.fn(),
    },
}));

describe('authApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should call apiClient.post with emailOrPhone and password', async () => {
            const mockResponse = { data: { success: true, token: 'fake-token' } };
            apiClient.post.mockResolvedValueOnce(mockResponse);

            const email = 'doctor@test.com';
            const password = 'Password@123';

            const result = await authApi.login(email, password);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
                emailOrPhone: email,
                password,
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw an error if the request fails', async () => {
            const mockError = new Error('Network Error');
            apiClient.post.mockRejectedValueOnce(mockError);

            await expect(authApi.login('test@test.com', 'pass')).rejects.toThrow('Network Error');
        });
    });

    describe('registerPatient', () => {
        it('should call apiClient.post with the provided data', async () => {
            const mockResponse = { data: { success: true } };
            apiClient.post.mockResolvedValueOnce(mockResponse);

            const patientData = { firstName: 'John', lastName: 'Doe', email: 'john@test.com' };
            const result = await authApi.registerPatient(patientData);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/register/patient', patientData);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('verifyOTP', () => {
        it('should send email payload if input contains @', async () => {
            apiClient.post.mockResolvedValueOnce({ data: { success: true } });

            await authApi.verifyOTP('test@test.com', '123456');

            expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/verify', {
                email: 'test@test.com',
                otp: '123456',
                purpose: 'registration'
            });
        });

        it('should send phone payload if input does not contain @', async () => {
            apiClient.post.mockResolvedValueOnce({ data: { success: true } });

            await authApi.verifyOTP('1234567890', '654321', 'login');

            expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/verify', {
                phone: '1234567890',
                otp: '654321',
                purpose: 'login'
            });
        });
    });
});
