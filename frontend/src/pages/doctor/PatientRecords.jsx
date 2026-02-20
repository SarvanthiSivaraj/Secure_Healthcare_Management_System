import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../../utils/tokenManager';

function PatientRecords() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchPatients(); }, []);

    const fetchPatients = async () => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/consent/doctor/patients`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPatients(response.data.data || []);
        } catch (err) {
            setError('Failed to load patient records.');
        } finally {
            setLoading(false);
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Patient Records</h1>
                            <p className="text-primary-100 text-sm">Access and manage patient medical records with consent verification</p>
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-primary-500">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 dark:text-dark-muted">Loading patients...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-red-700 dark:text-red-400">{error}</div>
                ) : patients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-dark-muted">
                        <svg className="w-16 h-16 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="font-medium">No patients have granted you access yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {patients.map(patient => (
                            <div key={patient.id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-card p-6 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{patient.first_name} {patient.last_name}</h3>
                                        <p className="text-xs text-gray-400 font-mono">ID: {patient.unique_health_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-gray-500 dark:text-dark-muted mb-4">
                                    <p>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                    <p>Gender: {patient.gender}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase">
                                        {patient.access_level} Access
                                    </span>
                                    <button
                                        onClick={() => navigate(`/doctor/patients/${patient.id}/records`)}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium hover:shadow-md hover:shadow-primary-500/30 transition-all duration-200"
                                    >
                                        View Records
                                    </button>
                                </div>
                                {patient.consent_expires_at && (
                                    <p className="text-xs text-gray-400 dark:text-dark-muted mt-3">
                                        Expires: {new Date(patient.consent_expires_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default PatientRecords;
