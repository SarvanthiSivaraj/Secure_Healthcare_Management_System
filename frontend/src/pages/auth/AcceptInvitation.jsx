import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { staffApi } from '../../api/staffApi';
import './AcceptInvitation.css';

function AcceptInvitation() {
    const navigate = useNavigate();
    const { token } = useParams();

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
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
                setSuccess(true);
                setTimeout(() => navigate('/login', {
                    state: { message: 'Account created successfully! Please login.' }
                }), 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create account. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="ai-page">
                <div className="ai-card ai-card--center">
                    <div className="ai-spinner"></div>
                    <p className="ai-loading-text">Validating your invitation…</p>
                </div>
            </div>
        );
    }

    if (validationError) {
        return (
            <div className="ai-page">
                <div className="ai-card">
                    <div className="ai-card-header">
                        <div className="ai-header-icon ai-header-icon--error">✕</div>
                        <h2 className="ai-card-title">Invalid Invitation</h2>
                        <p className="ai-card-subtitle">This invitation link is invalid or has expired.</p>
                    </div>
                    <div className="ai-alert ai-alert--error">{validationError}</div>
                    <Button className="ai-btn-full" onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="ai-page">
                <div className="ai-card ai-card--center">
                    <div className="ai-success-icon">✓</div>
                    <h2 className="ai-card-title">Account Created!</h2>
                    <p className="ai-card-subtitle">Redirecting you to the login page…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-page">
            {/* Header Banner */}
            <div className="ai-banner">
                <div className="ai-banner-inner">
                    <div className="ai-banner-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="ai-banner-title">Secure Healthcare</h1>
                        <p className="ai-banner-sub">Staff Onboarding Portal</p>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="ai-content">
                <div className="ai-card">
                    {/* Role Badge */}
                    <div className="ai-role-badge">
                        <span className="ai-role-dot"></span>
                        Invited as <strong>{invitation?.role}</strong>
                    </div>

                    <div className="ai-card-header">
                        <h2 className="ai-card-title">Complete Your Registration</h2>
                        <p className="ai-card-subtitle">
                            Set up your account to access the healthcare management system.
                        </p>
                    </div>

                    {/* Email info box */}
                    <div className="ai-info-box">
                        <span className="ai-info-label">📧 &nbsp;Invitation sent to</span>
                        <span className="ai-info-value">{invitation?.email}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="ai-form">
                        <div className="ai-form-row">
                            <Input
                                label="First Name"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                required
                            />
                            <Input
                                label="Last Name"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                required
                            />
                        </div>

                        <Input
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            required
                        />

                        <div className="ai-form-row">
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 8 characters"
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>

                        {error && <div className="ai-alert ai-alert--error">{error}</div>}

                        <Button
                            type="submit"
                            loading={submitting}
                            className="ai-btn-full ai-btn-primary"
                        >
                            Create My Account
                        </Button>
                    </form>

                    <p className="ai-footer-link">
                        Already have an account? <a href="/login">Sign in here</a>
                    </p>
                </div>

                {/* Features strip */}
                <div className="ai-features">
                    <div className="ai-feature-item">
                        <span>🔒</span> HIPAA Compliant
                    </div>
                    <div className="ai-feature-item">
                        <span>🛡️</span> Secure Auth
                    </div>
                    <div className="ai-feature-item">
                        <span>✓</span> Role-Based Access
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AcceptInvitation;
