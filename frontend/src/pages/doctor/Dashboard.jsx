import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import EmergencyToggle from '../../components/emergency/EmergencyToggle';

const NAV_CARDS = [
    {
        title: 'Patient Records',
        description: 'Access and manage patient medical records with consent verification',
        path: '/doctor/patients',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        title: 'Consultation Queue',
        description: 'View scheduled appointments and manage consultation workflow',
        path: '/doctor/active-visits',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        title: 'Consent Requests',
        description: 'Review and manage patient data access consent requests',
        path: '/doctor/consent',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    },
    {
        title: 'Clinical Notes',
        description: 'Create and update patient consultation notes and prescriptions',
        path: '/doctor/notes',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
    },
];

const STATS = [
    {
        label: "Today's Patients", value: '0',
        icon: <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
        label: 'Pending Consents', value: '0',
        icon: <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    },
    {
        label: 'Active Cases', value: '0',
        icon: <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    },
    {
        label: 'Consultations', value: '0',
        icon: <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    },
];

function DoctorDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [emergencyMode, setEmergencyMode] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">

            {/* Header */}
            <header className="bg-gradient-to-r from-primary-700 to-primary-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Doctor Portal</h1>
                            <p className="text-primary-100 text-sm">Patient Care & Medical Records Management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="h-[38px] w-[38px] flex items-center justify-center rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                            title="View Profile"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Doctor Info Bar */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card dark:shadow-none border border-gray-100 dark:border-dark-border p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            Dr. {user?.firstName || 'Sarah'} {user?.lastName || 'Johnson'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-dark-muted font-mono mt-1">
                            License: {user?.licenseNumber || 'MD-2024-789456'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Active Physician</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {STATS.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-6 text-center shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all duration-300 animate-fade-in overflow-hidden relative"
                        >
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                            <div className="flex justify-center mb-2">{stat.icon}</div>
                            <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-xs text-primary-100 font-medium uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Emergency Access */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card dark:shadow-none border border-gray-100 dark:border-dark-border p-6 mb-8 animate-fade-in">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-5 bg-primary-500 rounded-full inline-block"></span>
                        Emergency Access
                    </h2>
                    <EmergencyToggle
                        isActive={emergencyMode}
                        onToggle={setEmergencyMode}
                    />
                </div>

                {/* Clinical Services */}
                <div className="animate-fade-in">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-5 bg-primary-500 rounded-full inline-block"></span>
                        Clinical Services
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {NAV_CARDS.map((card) => (
                            <div
                                key={card.title}
                                onClick={() => navigate(card.path)}
                                className="group bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border shadow-card dark:shadow-none cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Accent bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-400 rounded-l-2xl transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                                {/* Glow orb */}
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-400/10 rounded-full blur-2xl group-hover:bg-primary-400/20 transition-all duration-300"></div>

                                <div className="flex items-start gap-4 relative">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors duration-200">
                                        {card.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {card.title}
                                            </h3>
                                            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed">{card.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-10">
                    &copy; 2026 SecureHealth Systems. Privacy & Terms
                </p>
            </main>
        </div>
    );
}

export default DoctorDashboard;
