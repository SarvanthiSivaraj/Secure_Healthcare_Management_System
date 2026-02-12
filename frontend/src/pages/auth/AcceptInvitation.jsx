import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { staffApi } from '../../api/staffApi';
import './Auth.css';

function AcceptInvitation() {
    const navigate = useNavigate();
    const { token } = useParams();

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

    // Validate invitation token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await staffApi.validateInvitation(token);
                if (response.success && response.data) {
                    setInvitation(response.data);
                } else {
                    setValidationError('Invalid or expired invitation');
                }
            } catch (err) {
                setValidationError(err.response?.data?.message || 'Invalid or expired invitation link');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            validateToken();
        } else {
            setValidationError('Missing invitation token');
            setLoading(false);
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setSubmitting(true);

        try {
            const response = await staffApi.acceptInvitation(token, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password,
                phone: formData.phone,
            });

            if (response.success) {
                alert('Account created successfully! Please login with your credentials.');
                navigate('/login', {
                    state: { message: 'Account created successfully! Please login.' }
                });
            }
        } catch (err) {
            console.error('Accept invitation error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create account. Please try again.';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="split-auth-container">
                <div className="auth-left-panel">
                    <div className="auth-branding">
                        <div className="brand-icon">
                            <div className="pulse-ring"></div>
                            <div className="heartbeat-icon">❤️</div>
                        </div>
                        <h1>Secure Healthcare</h1>
                        <p className="brand-tagline">Your Health, Your Privacy, Your Control</p>
                    </div>
                </div>
                <div className="auth-right-panel">
                    <div className="login-form-container">
                        <div className="loading-spinner">Validating invitation...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (validationError) {
        return (
            <div className="split-auth-container">
                <div className="auth-left-panel">
                    <div className="auth-branding">
                        <div className="brand-icon">
                            <div className="pulse-ring"></div>
                            <div className="heartbeat-icon">❤️</div>
                        </div>
                        <h1>Secure Healthcare</h1>
                        <p className="brand-tagline">Your Health, Your Privacy, Your Control</p>
                    </div>
                </div>
                <div className="auth-right-panel">
                    <div className="login-form-container">
                        <div className="form-header">
                            <h2>Invalid Invitation</h2>
                        </div>
                        <div className="error-alert">{validationError}</div>
                        <Button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="btn-primary btn-lg"
                        >
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="split-auth-container">
            {/* Left Side - Quote & Welcome */}
            <div className="auth-left-panel">
                <div className="auth-branding">
                    <div className="brand-icon">
                        <div className="pulse-ring"></div>
                        <div className="heartbeat-icon">❤️</div>
                    </div>
                    <h1>Secure Healthcare</h1>
                    <p className="brand-tagline">Your Health, Your Privacy, Your Control</p>
                </div>

                <div className="quote-section">
                    <div className="quote-icon">"</div>
                    <blockquote>
                        <p className="quote-text">
                            The good physician treats the disease; the great physician treats the patient who has the disease.
                        </p>
                        <cite>— William Osler</cite>
                    </blockquote>
                </div>

                <div className="features-list">
                    <div className="feature-item">
                        <span className="feature-icon">🔒</span>
                        <span>HIPAA Compliant</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🛡️</span>
                        <span>Secure Authentication</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Role-Based Access</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="auth-right-panel">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Complete Your Registration</h2>
                        <p className="form-subtitle">
                            You've been invited to join as {invitation?.role}
                        </p>
                        {invitation?.organizationName && (
                            <p className="form-subtitle">
                                Organization: <strong>{invitation.organizationName}</strong>
                            </p>
                        )}
                    </div>

                    <div className="info-alert" style={{ marginBottom: '1.5rem' }}>
                        <strong>Email:</strong> {invitation?.email}
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            label="First Name"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Last Name"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1234567890"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 characters"
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        {error && <div className="error-alert">{error}</div>}

                        <Button
                            type="submit"
                            loading={submitting}
                            className="btn-primary btn-lg"
                        >
                            Create Account
                        </Button>

                        <p className="auth-footer">
                            Already have an account? <a href="/login">Sign in</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AcceptInvitation;
