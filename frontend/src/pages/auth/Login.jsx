import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const successMessage = location.state?.message;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(formData.email, formData.password);
            const { user, token } = response;

            // Save user and token
            login(user, token);

            // Role-based redirect
            // Note: Backend returns HOSPITAL_ADMIN, DOCTOR, PATIENT, etc.
            const role = user.role.toUpperCase();

            switch (role) {
                case 'PATIENT':
                    navigate('/patient/dashboard');
                    break;
                case 'DOCTOR':
                    navigate('/doctor/dashboard');
                    break;
                case 'ADMIN':
                case 'HOSPITAL_ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'STAFF':
                case 'NURSE':
                case 'RECEPTIONIST':
                    navigate('/staff/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

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
                            The art of medicine consists of amusing the patient while nature cures the disease.
                        </p>
                        <cite>— Voltaire</cite>
                    </blockquote>
                </div>

                <div className="features-list">
                    <div className="feature-item">
                        <span className="feature-icon">🔒</span>
                        <span>HIPAA Compliant</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🛡️</span>
                        <span>End-to-End Encryption</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Patient Data Ownership</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="auth-right-panel">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p className="form-subtitle">Sign in to access your healthcare dashboard</p>
                    </div>

                    {successMessage && (
                        <div className="success-alert">{successMessage}</div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && <div className="error-alert">{error}</div>}

                        <Button type="submit" loading={loading} className="btn-primary btn-lg">
                            Sign In
                        </Button>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/dev-login')}
                            className="btn-lg"
                        >
                            🔧 Dev Login (No Backend)
                        </Button>

                        <p className="auth-footer">
                            Don't have an account? <a href="/register/patient">Register as Patient</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
