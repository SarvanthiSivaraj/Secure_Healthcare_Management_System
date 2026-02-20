import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { AuthContext } from '../../context/AuthContext';
import { emrApi } from '../../api/emrApi';
import '../patient/Dashboard.css'; // Shared dashboard theme
import './MedicalRecords.css';

function MedicalRecords() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedRecords, setExpandedRecords] = useState(new Set());

    const fetchRecords = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await emrApi.getPatientMedicalRecords(user.id);
            // Handle response structure: { success: true, data: { records: [] } }
            const recordList = response.data?.records || response.data || [];

            // Transform data to match UI expectations
            const formattedRecords = recordList.map(record => ({
                id: record.id,
                type: record.type, // consultation, diagnosis, prescription, lab_result, imaging, etc.
                date: record.created_at || record.visit_date,
                doctor: record.created_by_name || 'Unknown Provider',
                doctorRole: record.created_by_role || '',
                title: record.title,
                summary: record.description,
            }));

            setRecords(formattedRecords);
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        if (user && user.id) {
            fetchRecords();
        }
    }, [user, fetchRecords]);

    const filterRecords = () => {
        if (filter === 'all') return records;
        return records.filter(r => r.type === filter);
    };

    const toggleExpand = (recordId) => {
        setExpandedRecords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(recordId)) {
                newSet.delete(recordId);
            } else {
                newSet.add(recordId);
            }
            return newSet;
        });
    };

    const filteredRecords = filterRecords();

    const getRecordIcon = (type) => {
        switch (type) {
            case 'consultation': return '📋';
            case 'diagnosis': return '🔍';
            case 'prescription': return '💊';
            case 'lab_result': return '🔬';
            case 'imaging': return '🏥';
            case 'procedure': return '⚕️';
            case 'note': return '📝';
            default: return '📄';
        }
    };

    const formatRecordType = (type) => {
        const types = {
            'consultation': 'Consultation',
            'diagnosis': 'Diagnosis',
            'prescription': 'Prescription',
            'lab_result': 'Lab Result',
            'imaging': 'Imaging',
            'procedure': 'Procedure',
            'note': 'Clinical Note',
            'other': 'Other'
        };
        return types[type] || type;
    };

    return (
        <div className="dashboard-container bg-slate-50 dark:bg-slate-900 min-h-screen">
            <header className="w-full bg-gradient-to-r from-[#3a8d9b] to-[#257582] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center bg-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide m-0">My Medical Records</h1>
                        <p className="text-white/80 text-xs mt-0.5 m-0 font-medium">Complete history of your healthcare data</p>
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
                {/* Filter Tabs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-2 mb-6 overflow-x-auto flex gap-2 hide-scrollbar">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Records
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'consultation' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('consultation')}
                    >
                        📋 Consultations
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'diagnosis' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('diagnosis')}
                    >
                        🔍 Diagnoses
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'prescription' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('prescription')}
                    >
                        💊 Prescriptions
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'lab_result' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('lab_result')}
                    >
                        🔬 Lab Results
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'imaging' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('imaging')}
                    >
                        🏥 Imaging
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'procedure' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('procedure')}
                    >
                        ⚕️ Procedures
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'note' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('note')}
                    >
                        📝 Notes
                    </button>
                </div>

                {/* Records Timeline */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="spinner mb-4 mx-auto"></div>
                            <p>Loading medical records...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-lg m-0 mb-2">No {filter !== 'all' ? formatRecordType(filter).toLowerCase() : ''} records found.</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm m-0">
                                Medical records appear here after you have a consultation or procedure.
                                <br />They are added by your healthcare provider.
                            </p>
                        </div>
                    ) : (
                        filteredRecords.map((record) => {
                            const isExpanded = expandedRecords.has(record.id);
                            const shouldShowToggle = record.summary && record.summary.length > 150;

                            return (
                                <div key={record.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-400 transition-all p-5 flex gap-4 md:gap-6 items-start">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-teal-100">
                                        {getRecordIcon(record.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0 leading-tight">{record.title}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm m-0 mt-1">
                                                    {record.doctor} {record.doctorRole && `(${record.doctorRole})`} • {new Date(record.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="inline-flex px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-100 uppercase tracking-wide whitespace-nowrap self-start">
                                                {formatRecordType(record.type)}
                                            </span>
                                        </div>
                                        <p className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed m-0 mt-3 ${!isExpanded && shouldShowToggle ? 'line-clamp-2' : ''}`}>
                                            {record.summary}
                                        </p>
                                        {shouldShowToggle && (
                                            <button
                                                className="text-[#3a8d9b] hover:text-[#257582] text-sm font-semibold mt-2 focus:outline-none"
                                                onClick={() => toggleExpand(record.id)}
                                            >
                                                {isExpanded ? 'Show Less' : 'Show More'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Read-Only Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-5 mt-8 flex gap-4">
                    <div className="text-blue-500 dark:text-blue-400 text-xl flex-shrink-0 mt-0.5">🔒</div>
                    <div>
                        <h3 className="text-blue-900 dark:text-blue-200 font-bold text-base m-0 mb-2">Read-Only Access</h3>
                        <ul className="text-blue-800 dark:text-blue-300 text-sm list-disc pl-4 m-0 space-y-1">
                            <li>You can view all your medical records</li>
                            <li>Records cannot be edited or deleted by patients</li>
                            <li>Only authorized healthcare providers can add records</li>
                            <li>All access is logged for your security</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MedicalRecords;
