import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const logout = () => {
        // Mock logout function if Context's is not enough context
        if (typeof user?.logout === 'function') user.logout();
    };

    return (
        <div className="bg-mesh min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-500 text-slate-800 dark:text-slate-100">
            <div className="glass w-full max-w-[1440px] h-[90vh] rounded-[2.5rem] flex overflow-hidden shadow-2xl relative">
                <aside className="w-64 flex-shrink-0 flex flex-col p-8 border-r border-white/20 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/patient/dashboard')}>
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                            <span className="material-symbols-outlined material-icons-round">local_hospital</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Medicare</h1>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <button onClick={() => navigate('/patient/dashboard')} className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </button>
                        <button onClick={() => navigate('/patient/visits')} className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">calendar_today</span>
                            <span className="font-medium">Appointments</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3 sidebar-active text-primary rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">content_paste</span>
                            <span className="font-medium">Medical Records</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">forum</span>
                            <span className="font-medium">Messages</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">medication</span>
                            <span className="font-medium">Pharmacy</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">science</span>
                            <span className="font-medium">Laboratory</span>
                        </button>
                    </nav>

                    <div className="mt-auto space-y-2 pt-8 border-t border-white/10">
                        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">help_outline</span>
                            <span className="font-medium">Support</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all rounded-2xl">
                            <span className="material-symbols-outlined material-icons-round text-[22px]">settings</span>
                            <span className="font-medium">Settings</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="p-8 pb-4 flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Medical Records</h2>
                        <div className="flex items-center gap-4">
                            <button onClick={() => document.documentElement.classList.toggle('dark')} className="p-3 rounded-2xl glass-card hover:bg-white dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500 !block dark:!hidden">dark_mode</span>
                                <span className="material-symbols-outlined text-amber-500 !hidden dark:!block">light_mode</span>
                            </button>
                            <div className="flex items-center gap-3 px-4 py-2 glass rounded-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate('/profile')}>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-indigo-500 text-sm border-0">person</span>
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{user?.first_name || 'Patient'}</span>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                        <div className="glass border-indigo-200/50 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-900/10 p-5 mb-8 flex gap-4 items-start">
                            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <span className="material-symbols-outlined material-icons-round">lock</span>
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-indigo-900 dark:text-indigo-100">Read-Only Access</p>
                                <p className="text-indigo-700/80 dark:text-indigo-300/80 text-sm leading-relaxed">
                                    You can view all your medical records. Records cannot be edited or deleted by patients.
                                    Only authorized healthcare providers can add records. All access is logged for your security.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                            {['all', 'consultation', 'diagnosis', 'prescription', 'lab_result', 'imaging', 'procedure', 'note'].map((type) => (
                                <button
                                    key={type}
                                    className={`px-6 py-2.5 rounded-full font-medium transition-colors whitespace-nowrap ${filter === type ? 'bg-primary text-white shadow-lg shadow-indigo-500/30' : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'}`}
                                    onClick={() => setFilter(type)}
                                >
                                    {type === 'all' ? 'All Records' : formatRecordType(type)}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p>Loading medical records...</p>
                                </div>
                            ) : filteredRecords.length === 0 ? (
                                <div className="glass p-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50/50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl text-gray-400">content_paste_off</span>
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-bold text-lg m-0 mb-2">No {filter !== 'all' ? formatRecordType(filter).toLowerCase() : ''} records found.</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm m-0">
                                        Medical records appear here after you have a consultation or procedure.<br />
                                        They are added by your healthcare provider.
                                    </p>
                                </div>
                            ) : (
                                filteredRecords.map((record) => {
                                    const isExpanded = expandedRecords.has(record.id);
                                    const shouldShowToggle = record.summary && record.summary.length > 150;

                                    let bgClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
                                    let icon = "medical_services";
                                    let providerTag = "Provider";

                                    switch (record.type) {
                                        case 'lab_result':
                                            bgClass = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
                                            icon = "biotech";
                                            providerTag = "Laboratary";
                                            break;
                                        case 'prescription':
                                            bgClass = "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
                                            icon = "prescriptions";
                                            providerTag = "Medication";
                                            break;
                                        case 'consultation':
                                            icon = 'stethoscope';
                                            providerTag = 'Appointment';
                                            break;
                                        case 'note':
                                            bgClass = "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
                                            icon = "psychology";
                                            providerTag = "Note";
                                            break;
                                        default:
                                            break;
                                    }

                                    return (
                                        <div key={record.id} className="glass p-6 hover:translate-y-[-4px] transition-all cursor-pointer group" onClick={() => { if (shouldShowToggle) toggleExpand(record.id); }}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 ${bgClass} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                                        <span className="material-symbols-outlined material-icons-round text-3xl">{icon}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{record.title}</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{record.doctor} • {formatRecordType(record.type)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 md:ml-auto">
                                                    <div className="text-left md:text-right hidden sm:block max-w-[200px]">
                                                        <p className={`font-semibold text-gray-700 dark:text-gray-200 text-sm ${!isExpanded && shouldShowToggle ? 'line-clamp-1' : ''}`}>{record.summary || 'No summary provided'}</p>
                                                    </div>
                                                    <div className="text-left md:text-right min-w-[100px]">
                                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">{providerTag}</p>
                                                    </div>
                                                    <span className={`material-symbols-outlined material-icons-round text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-1'}`}>chevron_right</span>
                                                </div>
                                            </div>
                                            {isExpanded && record.summary && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 md:pl-[76px]">
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{record.summary}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </main>

                <aside className="w-80 flex-shrink-0 p-8 glass border-l border-white/20 dark:border-white/5 bg-white/10 hidden xl:flex flex-col">
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Record Insights</h3>
                        <div className="space-y-4">
                            <div className="p-5 glass border-white/40">
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Last Update</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {records.length > 0 ? new Date(records[0].date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : 'No records yet'}
                                </p>
                                <p className="text-gray-400 text-xs mt-2">
                                    {records.length > 0 ? `by ${records[0].doctor}` : ''}
                                </p>
                            </div>
                            <div className="p-5 glass border-white/40">
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Security Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="font-bold text-gray-800 dark:text-white">Encrypted & Secure</p>
                                </div>
                                <p className="text-gray-400 text-xs mt-2">ID: HR-{(Math.random() * 10000).toFixed(0)}-KM0</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 glass hover:bg-white/60 dark:hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 rounded-xl">
                                <span className="material-symbols-outlined material-icons-round text-primary">download</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Export PDF</span>
                            </button>
                            <button className="p-4 glass hover:bg-white/60 dark:hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 rounded-xl">
                                <span className="material-symbols-outlined material-icons-round text-primary">share</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Share</span>
                            </button>
                            <button className="p-4 glass hover:bg-white/60 dark:hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 rounded-xl">
                                <span className="material-symbols-outlined material-icons-round text-primary">print</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Print</span>
                            </button>
                            <button className="p-4 glass hover:bg-white/60 dark:hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 rounded-xl">
                                <span className="material-symbols-outlined material-icons-round text-primary">history</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Logs</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto glass bg-primary/10 border-primary/20 p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="material-symbols-outlined material-icons-round text-primary">verified_user</span>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">Insurance Sync</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            Your records are automatically synchronized with your provider.
                        </p>
                        <div className="w-full bg-white/30 dark:bg-white/10 rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full w-4/5"></div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default MedicalRecords;
