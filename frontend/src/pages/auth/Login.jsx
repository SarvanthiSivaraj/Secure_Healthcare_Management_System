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
            switch (user.role) {
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
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login</h2>
                <p className="auth-subtitle">Welcome back to Healthcare System</p>
                {successMessage && (
                    <div className="success-alert">{successMessage}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email"
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
                    <Button type="submit" loading={loading}>
                        Login
                    </Button>

                    <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-secondary)' }}>
                        — OR —
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/dev-login')}
                    >
                        🔧 Dev Login (No Backend)
                    </Button>

                    <p className="auth-footer">
                        Don't have an account? <a href="/register/patient">Register as Patient</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
export default Login;