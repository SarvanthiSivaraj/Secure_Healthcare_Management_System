import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './Auth.css';

function DevLogin() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const mockLogin = (role) => {
        // Create a mock JWT token (just for development)
        const mockUser = {
            id: '123',
            email: `${role.toLowerCase()}@test.com`,
            role: role,
            firstName: role === 'PATIENT'
                ? 'John'
                : role === 'DOCTOR'
                    ? 'Dr. Smith'
                    : role === 'ADMIN'
                        ? 'Admin'
                        : role === 'NURSE'
                            ? 'Nurse'
                            : role === 'LAB_TECHNICIAN'
                                ? 'Lab'
                                : role === 'RECEPTIONIST'
                                    ? 'Reception'
                                    : role === 'PHARMACIST'
                                        ? 'Pharmacy'
                                        : 'Staff',
            lastName: 'User',
            uniqueHealthId: role === 'PATIENT' ? 'UHI-20260203-123456' : undefined,
            professionalId: role === 'DOCTOR' ? 'DOC-123456' : undefined,
            organizationName: role === 'ADMIN' ? 'City Hospital' : undefined,
            staffRole: role === 'STAFF' ? 'Nurse' : undefined,
        };

        // Create a fake JWT token
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify(mockUser));
        const signature = 'fake-signature';
        const mockToken = `${header}.${payload}.${signature}`;

        // Login with mock data
        login(mockUser, mockToken);

        // Redirect based on role
        switch (role) {
            case 'PATIENT':
                navigate('/patient/dashboard');
                break;
            case 'DOCTOR':
                navigate('/doctor/dashboard');
                break;
            case 'ADMIN':
                navigate('/admin/dashboard');
                break;
            case 'STAFF':
                navigate('/staff/dashboard');
                break;
            case 'NURSE':
                navigate('/nurse/dashboard');
                break;
            case 'LAB_TECHNICIAN':
                navigate('/lab/dashboard');
                break;
            case 'RECEPTIONIST':
                navigate('/reception/dashboard');
                break;
            case 'PHARMACIST':
                navigate('/pharmacy/dashboard');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>🔧 Development Login</h2>
                <p className="auth-subtitle">
                    Choose a role to login as (Backend not required)
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <Button onClick={() => mockLogin('PATIENT')} variant="primary">
                        Login as Patient
                    </Button>

                    <Button onClick={() => mockLogin('DOCTOR')} variant="primary">
                        Login as Doctor
                    </Button>

                    <Button onClick={() => mockLogin('ADMIN')} variant="primary">
                        Login as Admin
                    </Button>

                    <Button onClick={() => mockLogin('STAFF')} variant="primary">
                        Login as Staff
                    </Button>

                    <Button onClick={() => mockLogin('NURSE')} variant="primary">
                        Login as Nurse
                    </Button>

                    <Button onClick={() => mockLogin('LAB_TECHNICIAN')} variant="primary">
                        Login as Lab Technician
                    </Button>

                    <Button onClick={() => mockLogin('RECEPTIONIST')} variant="primary">
                        Login as Receptionist
                    </Button>

                    <Button onClick={() => mockLogin('PHARMACIST')} variant="primary">
                        Login as Pharmacist
                    </Button>
                </div>

                <p className="auth-footer" style={{ marginTop: '24px' }}>
                    <a href="/login">Back to Real Login</a>
                </p>

                <div style={{
                    marginTop: '24px',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#92400e'
                }}>
                    ⚠️ <strong>Development Only:</strong> This page bypasses authentication. Remove before production!
                </div>
            </div>
        </div>
    );
}

export default DevLogin;
