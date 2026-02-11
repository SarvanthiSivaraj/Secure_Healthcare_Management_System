import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, setToken, removeToken } from '../utils/tokenManager';
import { authApi } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token) {
                try {
                    // Verify token with backend
                    const response = await authApi.verify();
                    if (response.success && response.user) {
                        console.log('DEBUG: AuthContext verified user:', response.user);
                        setUser(response.user);
                    } else {
                        throw new Error('Verification failed');
                    }
                } catch (error) {
                    // If verification fails, clear token (except maybe for network errors?)
                    // For now, assume auth failure
                    console.error('Token verification failed:', error);
                    removeToken();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData, token) => {
        // Normalize: ensure 'role' exists (backend might send 'role' or 'roleName')
        if (userData.roleName && !userData.role) {
            userData.role = userData.roleName;
        }
        console.log('🔐 Login called with user:', userData);
        console.log('🔐 User role:', userData.role);
        setUser(userData);
        setToken(token);
    };

    const logout = () => {
        setUser(null);
        removeToken();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for easier consumption
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};