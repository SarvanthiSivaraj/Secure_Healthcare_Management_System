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
        <div className="dashboard-container bg-slate-50 dark:bg-slate-900 min-h-screen">
            <header className="w-full bg-gradient-to-r from-[#3a8d9b] to-[#257582] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center bg-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide m-0">Consent Management</h1>
                        <p className="text-white/80 text-xs mt-0.5 m-0 font-medium">Control who can access your medical data</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="bg-white/20 hover:bg-white/30 transition-colors border border-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!showForm && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'active' ? 'bg-white dark:bg-slate-800 text-[#257582] dark:text-[#3a8d9b] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                onClick={() => setViewMode('active')}
                            >
                                Active Consents
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'history' ? 'bg-white dark:bg-slate-800 text-[#257582] dark:text-[#3a8d9b] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                onClick={() => setViewMode('history')}
                            >
                                Past Accesses
                            </button>
                        </div>
                        <button
                            className="bg-[#4a9fae] hover:bg-[#3a8d9b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                            onClick={() => { setEditingConsent(null); setShowForm(true); }}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            {viewMode === 'active' ? (
                                <>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 m-0">No Active Consents</h3>
                                    <p className="text-gray-500 dark:text-gray-400 m-0 text-sm">You haven't granted any consents yet. Click "Grant New Consent" to allow a doctor to access your medical data.</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 m-0">No History Available</h3>
                                    <p className="text-gray-500 dark:text-gray-400 m-0 text-sm">No past consent history found.</p>
                                </>
                            )}
                        </div>
                    )}

                    {!loading && consents.length > 0 && (
                        <div className="grid gap-4">
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
        </div>
    );
}
export default Consent;