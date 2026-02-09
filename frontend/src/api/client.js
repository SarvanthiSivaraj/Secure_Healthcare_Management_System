import axios from 'axios';
import { getAuthHeader, removeToken } from '../utils/tokenManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const authHeader = getAuthHeader();
        if (authHeader.Authorization) {
            config.headers.Authorization = authHeader.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Global error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Allow login to fail without redirecting (user might just be typing wrong password)
            if (!error.config.url.includes('/auth/login')) {
                removeToken();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
