import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';
import VisitCard from '../../components/visit/VisitCard';

function ActiveVisits() {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchVisits();
        const interval = setInterval(fetchVisits, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const data = await visitApi.getActiveVisits();
            setVisits(data.data || []);
        } catch (error) {
            console.error('Failed to fetch visits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, visitId) => {
        try {
            if (action === 'view') {
                console.log('View visit:', visitId);
            } else if (action === 'close') {
                const notes = prompt('Enter closing notes (optional):');
                await visitApi.closeVisit(visitId, notes || '');
                setSuccessMessage('Visit closed successfully!');
                fetchVisits();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            {/* Header */}
            <header className="bg-gradient-to-r from-primary-700 to-primary-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Consultation Queue</h1>
                            <p className="text-primary-100 text-sm">View scheduled appointments and manage consultation workflow</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Success Toast */}
                {successMessage && (
                    <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl text-green-700 dark:text-green-400 font-medium">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {successMessage}
                    </div>
                )}

                {/* Stats + Refresh Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl px-8 py-4 text-center shadow-lg shadow-primary-500/20">
                        <div className="text-3xl font-bold text-white">{visits.length}</div>
                        <div className="text-xs text-primary-100 uppercase tracking-wide font-medium">Active Consultations</div>
                    </div>
                    <button
                        onClick={fetchVisits}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-white text-sm font-medium hover:border-primary-400 hover:text-primary-600 transition-all duration-200 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>

                {/* Visits List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 dark:text-dark-muted">Loading active visits...</p>
                    </div>
                ) : visits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-dark-muted">
                        <svg className="w-16 h-16 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="font-medium">No active visits</p>
                        <p className="text-sm">Active patient visits will appear here for consultation</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visits.map(visit => (
                            <VisitCard key={visit.id} visit={visit} userRole="doctor" onAction={handleAction} showActions={true} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ActiveVisits;
