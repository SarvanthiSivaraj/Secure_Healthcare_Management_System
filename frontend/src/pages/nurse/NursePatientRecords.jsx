import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { nurseApi } from '../../api/nurseApi';
import ThemeToggle from '../../components/common/ThemeToggle';
import '../../pages/patient/Dashboard.css';

const NursePatientRecords = () => {
    const { id: patientId } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRecord, setNewRecord] = useState({ type: 'vitals', title: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, [patientId]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await nurseApi.getPatientRecords(patientId);
            if (response && response.success) {
                setRecords(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching patient records:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const response = await nurseApi.addPatientRecord(patientId, newRecord);
            if (response && response.success) {
                setShowAddForm(false);
                setNewRecord({ type: 'vitals', title: '', description: '' });
                fetchRecords(); // Refresh the list
            }
        } catch (error) {
            console.error("Error adding patient record:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatType = (type) => {
        const types = {
            'vitals': 'Vitals Check',
            'observation': 'Clinical Observation',
            'input_action': 'Input / Action'
        };
        return types[type] || type;
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'vitals': return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800';
            case 'observation': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
            case 'input_action': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
            default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="patient-dashboard-wrapper bg-[var(--background-light)] dark:bg-[var(--background-dark)] text-slate-800 dark:text-slate-100 flex h-screen w-full overflow-hidden">
            {/* Theme Toggle styling */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl -z-10 transform -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                <header className="px-8 py-6 flex items-center justify-between flex-shrink-0 z-10 sticky top-0 bg-[var(--background-light)]/80 dark:bg-[var(--background-dark)]/80 backdrop-blur-md border-b border-transparent transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/nurse/patients')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                                Patient Records
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Patient ID: {patientId}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-4 pb-20 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header Actions */}
                        <div className="flex justify-between items-center bg-white/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm backdrop-blur-xl">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                                <span className="material-symbols-outlined text-teal-500 text-[20px]">history</span>
                                Nursing History
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-teal-600/20"
                            >
                                <span className="material-symbols-outlined text-[18px]">{showAddForm ? 'close' : 'add'}</span>
                                {showAddForm ? 'Cancel' : 'Add Record'}
                            </button>
                        </div>

                        {/* Add Record Form */}
                        {showAddForm && (
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-teal-200/80 dark:border-teal-700/80 p-6 shadow-lg shadow-teal-500/5 animate-fade-in-up">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Nursing Record</h3>
                                <form onSubmit={handleAddRecord} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Record Type</label>
                                            <select
                                                value={newRecord.type}
                                                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                                            >
                                                <option value="vitals">Vitals Check</option>
                                                <option value="observation">Clinical Observation</option>
                                                <option value="input_action">Input / Action</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={newRecord.title}
                                                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                                                placeholder="Brief title..."
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Details & Description</label>
                                            <textarea
                                                required
                                                value={newRecord.description}
                                                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                                rows="3"
                                                placeholder="Enter detailed notes here..."
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition shadow-md disabled:opacity-50"
                                        >
                                            {submitting ? 'Saving...' : 'Save Record'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Records List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            </div>
                        ) : records.length > 0 ? (
                            <div className="space-y-4 relative">
                                {/* Timeline line */}
                                <div className="absolute top-4 bottom-4 left-6 md:left-8 w-0.5 bg-slate-200 dark:bg-slate-700/50 z-0"></div>

                                {records.map((record, idx) => (
                                    <div key={record.id} className="relative z-10 flex gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        {/* Timeline dot */}
                                        <div className="mt-6 flex-shrink-0 w-3 h-3 md:w-4 md:h-4 bg-teal-500 rounded-full ring-4 ring-white dark:ring-[var(--background-dark)] z-10 mx-[21px] md:mx-[26px]"></div>

                                        {/* Record Card */}
                                        <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${getTypeColor(record.type)}`}>
                                                        {formatType(record.type)}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{record.title}</h3>
                                                </div>
                                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(record.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 border border-slate-100 dark:border-slate-800/50">
                                                {record.description}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                                                    {record.created_by_name?.charAt(0) || 'N'}
                                                </div>
                                                {record.created_by_name} ({record.created_by_role})
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white/40 dark:bg-slate-800/20 backdrop-blur-lg rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <span className="material-symbols-outlined text-[32px] text-slate-400">history_off</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Records Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    There are no nursing records for this patient yet. Click "Add Record" to create one.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NursePatientRecords;
