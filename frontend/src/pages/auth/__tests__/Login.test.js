import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import Login from '../Login';
import { server } from '../../../mocks/server';
import { rest } from 'msw';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mock simplewebauthn to avoid browser-specific API issues in jsdom environment
jest.mock('@simplewebauthn/browser', () => ({
    startAuthentication: jest.fn(),
}));

// Mock the ThemeToggle and ParticleBackground since they aren't relevant to login logic
jest.mock('../../../components/common/ThemeToggle', () => () => <div data-testid="theme-toggle" />);
jest.mock('../../../components/common/ParticleBackground', () => () => <div data-testid="particle-bg" />);

const mockLogin = jest.fn();

const renderLogin = (state = null) => {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
            <AuthContext.Provider value={{ login: mockLogin }}>
                <Login />
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

describe('Login Component (Integration)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('email@example.com or +91...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('shows success message from router state if present', () => {
        renderLogin({ message: 'Registration successful!' });
        expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });

    it('handles successful login and calls context login', async () => {
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('email@example.com or +91...'), {
            target: { value: 'doctor@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'TestPass@123' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        // Loading text should appear
        expect(screen.getByText('Signing In...')).toBeInTheDocument();

        await waitFor(() => {
            // login() from context should be called with user and token from server
            expect(mockLogin).toHaveBeenCalledWith(
                expect.objectContaining({ email: 'doctor@test.com', role: 'doctor' }),
                'fake-jwt-token'
            );
        });
    });

    it('handles failed login and displays error message', async () => {
        // Override the MSW handler to simulate a 401 failure
        server.use(
            rest.post(`${BASE_URL}/api/auth/login`, (_req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({ success: false, message: 'Invalid email or password' })
                );
            })
        );

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('email@example.com or +91...'), {
            target: { value: 'wrong@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'wrongpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });
});
