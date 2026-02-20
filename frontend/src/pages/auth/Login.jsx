import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { startAuthentication } from '@simplewebauthn/browser';
import ThemeToggle from '../../components/common/ThemeToggle';
import ParticleBackground from '../../components/common/ParticleBackground';
import loginBg from '../../assets/images/login-bg.png';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [error, setError] = useState('');
    const successMessage = location.state?.message;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const navigateByRole = (role) => {
        const r = role?.toUpperCase();
        switch (r) {
            case 'PATIENT': navigate('/patient/dashboard'); break;
            case 'DOCTOR': navigate('/doctor/dashboard'); break;
            case 'ADMIN':
            case 'HOSPITAL_ADMIN':
            case 'SYSTEM_ADMIN': navigate('/admin/dashboard'); break;
            case 'NURSE': navigate('/nurse/dashboard'); break;
            case 'LAB_TECHNICIAN': navigate('/lab/dashboard'); break;
            case 'RADIOLOGIST': navigate('/radiology/dashboard'); break;
            default: navigate('/staff/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(formData.email, formData.password);

            const payload = response.data || response;
            const user = payload.user || payload.data?.user;
            const accessToken = payload.accessToken || payload.token || payload.data?.accessToken;

            if (!user || !accessToken) {
                throw new Error('Invalid server response: Missing user/token');
            }

            login(user, accessToken);
            navigateByRole(user.role);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        if (!formData.email) {
            setError('Please enter your email address first');
            return;
        }

        setError('');
        setPasskeyLoading(true);

        try {
            // Step 1: Get authentication options from server
            const optionsRes = await authApi.passkeyLoginOptions(formData.email);
            if (!optionsRes.success) {
                throw new Error(optionsRes.message || 'Failed to get passkey options');
            }

            // Step 2: Trigger browser's WebAuthn prompt (fingerprint, face, PIN, etc.)
            const credential = await startAuthentication({ optionsJSON: optionsRes.data });

            // Step 3: Verify with server
            const verifyRes = await authApi.passkeyLoginVerify(formData.email, credential);

            const payload = verifyRes.data || verifyRes;
            const user = payload.user || payload.data?.user;
            const accessToken = payload.accessToken || payload.token || payload.data?.accessToken;

            if (!user || !accessToken) {
                throw new Error('Invalid server response');
            }

            login(user, accessToken);
            navigateByRole(user.role);
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Passkey authentication was cancelled');
            } else {
                const errorMsg = err.response?.data?.message || err.message || 'Passkey login failed';
                setError(errorMsg);
            }
        } finally {
            setPasskeyLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 sm:p-6 lg:p-8 transition-colors duration-300 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <ParticleBackground />

            {/* Theme Toggle styling */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-6xl bg-white dark:bg-dark-card rounded-3xl shadow-card dark:shadow-none hover:shadow-2xl hover:shadow-primary-500/20 dark:hover:shadow-glow transform transition-all duration-500 overflow-hidden flex flex-col lg:flex-row min-h-[600px] animate-fade-in z-10">

                {/* Left Side - Image & Branding */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-primary-700 to-primary-600 text-white">
                    <div className="relative z-10 group">
                        <div className="flex items-center space-x-3 mb-6 transform transition-transform duration-300 group-hover:translate-x-2">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg group-hover:shadow-primary-500/50 transition-shadow duration-300">
                                <span className="text-2xl animate-pulse-slow">❤️</span>
                            </div>
                            <span className="text-2xl font-bold tracking-wide text-white">SecureHealth</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-4 text-white drop-shadow-lg">
                            Advanced Healthcare <br /> Management System
                        </h1>
                        <p className="text-primary-100 text-lg max-w-sm">
                            Secure, efficient, and patient-centric platform for modern medical facilities.
                        </p>
                    </div>

                    <div className="relative z-10 glass-panel p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-[1.02]">
                        <blockquote className="text-lg italic font-light mb-4 text-white">
                            "The art of medicine consists of amusing the patient while nature cures the disease."
                        </blockquote>
                        <cite className="block text-primary-200 font-semibold not-italic">— Voltaire</cite>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-dark-card relative transition-colors duration-300">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10 group">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">Welcome Back</h2>
                            <p className="text-gray-500 dark:text-dark-muted">Sign in to access your dashboard</p>
                        </div>

                        {successMessage && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center shadow-sm animate-slide-down">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center shadow-sm animate-slide-down">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-border rounded-xl leading-5 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 sm:text-sm shadow-sm"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-border rounded-xl leading-5 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 sm:text-sm shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-[1.02] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Sign In'}
                            </button>

                            {/* Passkey Divider */}
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 font-medium">or</span>
                                </div>
                            </div>

                            {/* Passkey Login Button */}
                            <button
                                type="button"
                                onClick={handlePasskeyLogin}
                                disabled={passkeyLoading}
                                className={`w-full inline-flex justify-center items-center px-4 py-3.5 border-2 border-primary-200 dark:border-primary-700/50 shadow-sm text-sm font-semibold rounded-xl text-primary-700 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 transform hover:scale-[1.02] ${passkeyLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {passkeyLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 mr-2.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                )}
                                {passkeyLoading ? 'Authenticating...' : 'Sign in with Passkey'}
                            </button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 font-medium">Developer Access</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/dev-login')}
                                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                            >
                                <svg className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Developer Login (No Backend)
                            </button>

                            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                Don't have an account?{' '}
                                <a href="/register" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline transition-colors">
                                    Create new account
                                </a>
                            </p>
                        </form>
                    </div>

                    <div className="absolute bottom-6 w-full text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            &copy; 2026 SecureHealth Systems. privacy & terms
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
