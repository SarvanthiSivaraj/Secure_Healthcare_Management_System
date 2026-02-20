import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { consentApi } from '../../api/consentApi';
import { visitApi } from '../../api/visitApi';
import { emrApi } from '../../api/emrApi';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import './Dashboard.css';

// Remove image imports and replace with inline SVGs for cleaner Doctor Portal match

function PatientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({
        activeConsents: 0,
        medicalRecords: 0,
        scheduledVisits: 0,
        accessLogs: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;

            try {
                const [consentsRes, recordsRes, visitsRes] = await Promise.allSettled([
                    consentApi.getActiveConsents(),
                    emrApi.getPatientMedicalRecords(user.id),
                    visitApi.getMyVisits()
                ]);

                setStats({
                    activeConsents: consentsRes.status === 'fulfilled'
                        ? (Array.isArray(consentsRes.value)
                            ? consentsRes.value.length
                            : (Array.isArray(consentsRes.value?.data) ? consentsRes.value.data.length : 0))
                        : 0,
                    medicalRecords: recordsRes.status === 'fulfilled' ? (recordsRes.value?.data?.records?.length || recordsRes.value?.data?.length || 0) : 0,
                    scheduledVisits: visitsRes.status === 'fulfilled' ? (visitsRes.value?.filter(v => ['approved', 'pending', 'scheduled'].includes(v.status?.toLowerCase())).length || 0) : 0,
                    accessLogs: 0 // TODO: Implement access logs API
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        fetchStats();
    }, [user?.id]);

    return (
        <div className="dashboard-container bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Header matches Doctor Portal style - Teal gradient, white text */}
            <header className="w-full bg-gradient-to-r from-[#3a8d9b] to-[#257582] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center bg-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide m-0">Patient Portal</h1>
                        <p className="text-white/80 text-xs mt-0.5 m-0 font-medium">Healthcare Data & Medical Records Management</p>
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
                        className="bg-white/20 hover:bg-white/30 transition-colors border border-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* User Info Bar - Solid white card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <div className="text-lg font-bold text-gray-800 dark:text-white">
                                {user?.firstName || 'Patient Name'} {user?.lastName || ''}
                            </div>
                            <div className="text-gray-500 text-sm mt-1">
                                ID: {user?.id || 'MD-2024-789456'}
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-0 px-4 py-1.5 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                            <span className="text-green-700 dark:text-green-400 text-sm font-semibold">Active Patient</span>
                        </div>
                    </div>

                    <PasskeySetupCard />
                </div>

                {/* Stats row - Teal cards like Doctor Portal */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'ACTIVE CONSENTS', value: stats.activeConsents, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
                        { label: 'MEDICAL RECORDS', value: stats.medicalRecords, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
                        { label: 'SCHEDULED VISITS', value: stats.scheduledVisits, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> },
                        { label: 'ACCESS LOGS', value: stats.accessLogs, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-[#4a9fae] dark:bg-[#3a8d9b] rounded-xl p-5 text-white flex flex-col items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300">
                            <div className="mb-2 opacity-90">{stat.icon}</div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-[10px] sm:text-xs font-semibold tracking-wider opacity-90 text-center">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Patient Services */}
                <div className="mt-8">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-1.5 h-5 bg-[#4a9fae] rounded-full"></div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white m-0">Patient Services</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                path: '/patient/consent',
                                title: 'Consent Requests',
                                desc: 'Review and manage healthcare provider data access protocols',
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            },
                            {
                                path: '/patient/medical-records',
                                title: 'Patient Records',
                                desc: 'Access and manage your complete medical history',
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            },
                            {
                                path: '/patient/visits',
                                title: 'Visit Management',
                                desc: 'View scheduled appointments and request workflow visits',
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            },
                            {
                                path: '/patient/audit-trail',
                                title: 'Access Logs',
                                desc: 'Track external healthcare provider access to your data',
                                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            }
                        ].map((service, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(service.path)}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex items-start space-x-4 cursor-pointer hover:shadow-md hover:border-teal-200 transition-all group"
                            >
                                <div className="p-3 bg-teal-50 text-[#4a9fae] rounded-lg group-hover:bg-[#4a9fae] group-hover:text-white transition-colors">
                                    {service.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-800 dark:text-gray-100 font-bold m-0 group-hover:text-[#257582] transition-colors">{service.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 m-0 pr-4 leading-relaxed">{service.desc}</p>
                                </div>
                                <div className="text-gray-300 flex items-center h-full pt-2 group-hover:text-[#4a9fae] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PatientDashboard;