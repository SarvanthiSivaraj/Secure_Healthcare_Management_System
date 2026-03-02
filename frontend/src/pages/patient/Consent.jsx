import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsentForm from '../../components/consent/ConsentForm';
import ConsentCard from '../../components/consent/ConsentCard';
import { consentApi } from '../../api/consentApi';
import '../patient/Dashboard.css'; // Shared dashboard theme
import './Consent.css';

function Consent() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'
    const [showForm, setShowForm] = useState(false);
    const [editingConsent, setEditingConsent] = useState(null);
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (viewMode === 'active') {
            loadConsents();
        } else {
            loadHistory();
        }
    }, [viewMode]);

    const loadConsents = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await consentApi.getActiveConsents();
            setConsents(data || []);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status !== 404) {
                setError('Failed to load active consents');
            } else {
                setConsents([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        setLoading(true);
        setError('');
        try {
            // Check if getConsentHistory exists before calling
            if (typeof consentApi.getConsentHistory !== 'function') {
                throw new Error('History API not implemented yet');
            }
            const data = await consentApi.getConsentHistory();
            setConsents(data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load consent history');
            setConsents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGrantSuccess = useCallback(() => {
        setShowForm(false);
        setEditingConsent(null);
        // Switch to active view to see new consent
        if (viewMode !== 'active') {
            setViewMode('active');
        } else {
            loadConsents();
        }
    }, [viewMode]);

    const handleEdit = useCallback((consent) => {
        setEditingConsent(consent);
        setShowForm(true);
    }, []);

    const handleRevoke = useCallback(async (consentId) => {
        try {
            await consentApi.revokeConsent(consentId);
            // Refresh current view
            if (viewMode === 'active') {
                loadConsents();
            } else {
                loadHistory();
            }
        } catch (err) {
            alert('Failed to revoke consent: ' + (err.response?.data?.message || err.message));
        }
    }, [viewMode]);

    return (
        <div className="patient-dashboard-wrapper bg-[var(--background-light)] dark:bg-[var(--background-dark)] text-slate-800 dark:text-slate-100 p-4 lg:p-8">
            <div className="max-w-[1440px] mx-auto glass-panel rounded-3xl min-h-[90vh] shadow-2xl flex flex-col overflow-hidden relative">
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="p-8 pb-4 flex justify-between items-center border-b border-gray-100/20 dark:border-white/5 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-tr from-[#3a8d9b] to-[#257582] rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <span className="material-symbols-outlined material-icons-round">verified_user</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white m-0">Consent Management</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm m-0 mt-1 font-medium">Control who can access your medical data</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => document.documentElement.classList.toggle('dark')} className="glass-card p-3 rounded-xl hover:bg-white/40 dark:hover:bg-slate-700/50 transition flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500 !block dark:!hidden">dark_mode</span>
                                <span className="material-symbols-outlined text-amber-500 !hidden dark:!block">light_mode</span>
                            </button>
                            <button
                                onClick={() => navigate('/patient/dashboard')}
                                className="glass-card hover:bg-white/40 dark:hover:bg-slate-700/50 transition-colors text-gray-700 dark:text-gray-200 font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to Dashboard
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        {!showForm && (
                            <div className="glass-card p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex bg-indigo-50/50 dark:bg-indigo-900/20 p-1.5 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10">
                                    <button
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        onClick={() => setViewMode('active')}
                                    >
                                        Active Consents
                                    </button>
                                    <button
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        onClick={() => setViewMode('history')}
                                    >
                                        Past Accesses
                                    </button>
                                </div>
                                <button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md shadow-indigo-500/20 flex items-center"
                                    onClick={() => { setEditingConsent(null); setShowForm(true); }}
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-2 text-indigo-200">add_circle</span>
                                    Grant New Consent
                                </button>
                            </div>
                        )}

                        {showForm && (
                            <ConsentForm
                                initialData={editingConsent}
                                onSuccess={handleGrantSuccess}
                                onCancel={() => { setShowForm(false); setEditingConsent(null); }}
                            />
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-5 bg-[#4a9fae] rounded-full"></div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white m-0">{viewMode === 'active' ? 'Active Consents' : 'Access History'}</h2>
                            </div>

                            {loading && <div className="text-center py-8 text-gray-500">Loading consents...</div>}

                            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>}

                            {!loading && consents.length === 0 && (
                                <div className="glass-card rounded-xl shadow-sm border border-white/40 dark:border-white/10 p-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">verified_user</span>
                                    </div>
                                    {viewMode === 'active' ? (
                                        <>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-2 m-0">No Active Consents</h3>
                                            <p className="text-gray-500 dark:text-slate-400 m-0 text-sm">You haven't granted any consents yet. Click "Grant New Consent" to allow a doctor to access your medical data.</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-2 m-0">No History Available</h3>
                                            <p className="text-gray-500 dark:text-slate-400 m-0 text-sm">No past consent history found.</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {!loading && consents.length > 0 && (
                                <div className="grid grid-cols-1 gap-6">
                                    {consents.map((consent) => (
                                        <ConsentCard
                                            key={consent.id}
                                            consent={consent}
                                            onRevoke={handleRevoke}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Consent;