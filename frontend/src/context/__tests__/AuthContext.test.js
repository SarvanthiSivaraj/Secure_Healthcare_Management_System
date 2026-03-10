import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { authApi } from '../../api/authApi';
import * as tokenManager from '../../utils/tokenManager';

// Mock dependencies
jest.mock('../../api/authApi');
jest.mock('../../utils/tokenManager');

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with no user if no token exists', async () => {
        tokenManager.getToken.mockReturnValue(null);

        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {({ user, loading }) => (
                        <div>
                            <span data-testid="loading">{loading.toString()}</span>
                            <span data-testid="user">{user ? user.email : 'No user'}</span>
                        </div>
                    )}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        // Should finish loading immediately and have no user
        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
            expect(screen.getByTestId('user').textContent).toBe('No user');
        });
    });

    it('should fetch and set user if a valid token exists', async () => {
        tokenManager.getToken.mockReturnValue('valid-token');
        const mockUser = { email: 'test@doctor.com', role: 'doctor' };
        authApi.verify.mockResolvedValue({ success: true, user: mockUser });

        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {({ user, loading }) => (
                        <div>
                            <span data-testid="loading">{loading.toString()}</span>
                            <span data-testid="user">{user ? user.email : 'No user'}</span>
                        </div>
                    )}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        // Verification happens asynchronously
        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
            expect(screen.getByTestId('user').textContent).toBe('test@doctor.com');
        });

        expect(authApi.verify).toHaveBeenCalledTimes(1);
    });

    it('should handle token verification failure', async () => {
        tokenManager.getToken.mockReturnValue('invalid-token');
        authApi.verify.mockRejectedValue(new Error('Invalid token'));

        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {({ user, loading }) => (
                        <div>
                            <span data-testid="loading">{loading.toString()}</span>
                            <span data-testid="user">{user ? user.email : 'No user'}</span>
                        </div>
                    )}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
            expect(screen.getByTestId('user').textContent).toBe('No user');
        });

        // It should attempt to remove the invalid token
        expect(tokenManager.removeToken).toHaveBeenCalledTimes(1);
    });
});
