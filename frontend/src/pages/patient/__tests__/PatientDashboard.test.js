import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import PatientDashboard from '../Dashboard';
import { server } from '../../../mocks/server';
import { rest } from 'msw';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

jest.mock('../../../components/common/ThemeToggle', () => () => <div data-testid="theme-toggle" />);

const mockLogout = jest.fn();
const mockUser = { id: 'uuid-1', firstName: 'John', lastName: 'Doe', role: 'patient' };

const renderDashboard = (user = mockUser) => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={{ user, logout: mockLogout }}>
                <PatientDashboard />
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

describe('PatientDashboard Component (Integration)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the dashboard header', () => {
        renderDashboard();
        expect(screen.getByText('Patient Hub')).toBeInTheDocument();
    });

    it('displays active consent count from API', async () => {
        renderDashboard();
        // Default handler returns 2 active consents
        await waitFor(() => {
            expect(screen.getByText('2 GRANTED')).toBeInTheDocument();
        });
    });

    it('displays health facts fetched from API', async () => {
        renderDashboard();
        await waitFor(() => {
            expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
            expect(screen.getByText('Normal 120/80')).toBeInTheDocument();
        });
    });

    it('displays activity history fetched from API', async () => {
        renderDashboard();
        await waitFor(() => {
            expect(screen.getByText('Logged in')).toBeInTheDocument();
        });
    });

    it('shows "no active visits in queue" when visits are empty', async () => {
        // Override visits endpoint to return empty
        server.use(
            rest.get(`${BASE_URL}/visits/my-visits`, (_req, res, ctx) => {
                return res(ctx.status(200), ctx.json({ success: true, data: [] }));
            })
        );
        renderDashboard();
        await waitFor(() => {
            expect(screen.getByText('No active visits in queue')).toBeInTheDocument();
        });
    });
});
