import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

const renderProtectedRoute = (user, loading = false, allowedRoles = undefined) => {
    return render(
        <AuthContext.Provider value={{ user, loading }}>
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute allowedRoles={allowedRoles}>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('ProtectedRoute Component', () => {
    it('renders loading state when auth is loading', () => {
        renderProtectedRoute(null, true);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('redirects to /login if user is not authenticated', () => {
        renderProtectedRoute(null, false);
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders children if user is authenticated and no allowedRoles specified', () => {
        const mockUser = { role: 'patient' };
        renderProtectedRoute(mockUser, false);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children if user is authenticated and role matches allowedRoles', () => {
        const mockUser = { role: 'doctor' };
        renderProtectedRoute(mockUser, false, ['doctor', 'nurse']);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to /unauthorized if user role does not match allowedRoles', () => {
        const mockUser = { role: 'patient' };
        renderProtectedRoute(mockUser, false, ['doctor', 'nurse']);
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    });

    it('handles roleName property normalization', () => {
        // Tests the normalization from roleName to role fallback
        const mockUser = { roleName: 'DOCTOR' }; // Test case-insensitivity as well
        renderProtectedRoute(mockUser, false, ['doctor']);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
