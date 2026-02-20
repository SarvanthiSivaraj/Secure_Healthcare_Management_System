import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import './Profile.css';

function Profile() {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userApi.getProfile();
                if (response.success) {
                    const u = response.data.user;
                    setFormData({
                        firstName: u.firstName || u.first_name || '',
                        lastName: u.lastName || u.last_name || '',
                        phone: u.phone || ''
                    });
                }
            } catch (err) {
                setError('Failed to load profile information');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await userApi.updateProfile(formData);
            if (response.success) {
                setSuccess('Profile updated successfully');
                const u = response.data;
                // Update local context
                const updatedUser = {
                    ...user,
                    firstName: u.firstName || u.first_name,
                    lastName: u.lastName || u.last_name,
                    phone: u.phone
                };
                const token = localStorage.getItem('token');
                login(updatedUser, token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-container bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Header - More compact */}
            <header className="profile-header bg-gradient-to-r from-[#3a8d9b] to-[#257582] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight m-0">Account Profile</h1>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => window.history.back()}
                        className="text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
                    >
                        Back
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - User Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 p-8 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#4a9fae]"></div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/20 text-[#4a9fae] rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-white dark:border-slate-800 shadow-md">
                                    <span className="text-3xl font-bold uppercase">
                                        {user?.firstName?.[0] || user?.email?.[0]}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-[#4a9fae] font-semibold text-sm uppercase tracking-widest mb-4">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                                <div className="flex justify-center">
                                    <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                                        {user?.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security Quick Link */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Security</h3>
                            <PasskeySetupCard />
                        </div>
                    </div>

                    {/* Right Column - Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 p-8 sm:p-10 relative overflow-hidden">
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="w-2 h-6 bg-[#4a9fae] rounded-full"></div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white m-0">Personal Information</h2>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-center text-sm animate-shake">
                                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/50 flex items-center text-sm animate-fade-in">
                                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-medium"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-medium"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address (Read-only)</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full px-5 py-3.5 bg-gray-100 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-400 dark:text-slate-500 cursor-not-allowed font-medium"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-medium"
                                        placeholder="e.g. +1 234 567 890"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#4a9fae] to-[#257582] text-white font-bold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;
