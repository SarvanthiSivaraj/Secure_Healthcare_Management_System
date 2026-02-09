import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, setToken, removeToken } from '../utils/tokenManager';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            // TODO: Validate token with backend
            // For now, decode JWT payload (in production, validate with backend)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser(payload);
            } catch (error) {
                removeToken();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
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