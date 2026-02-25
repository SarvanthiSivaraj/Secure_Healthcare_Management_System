import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auditApi from '../../api/auditApi';
import '../patient/Dashboard.css'; // Shared dashboard theme

function AuditTrail() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 50, offset: 0 });

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Reset to page 1 when filters change
        setCurrentPage(1);
    }, [actionFilter, startDate, endDate]);

    useEffect(() => {
        fetchAuditLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, actionFilter, startDate, endDate]);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: pagination.limit,
                offset: (currentPage - 1) * pagination.limit,
            };

            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (actionFilter) params.action = actionFilter;

            const result = await auditApi.getMyAuditTrail(params);

            if (result.success) {
                setLogs(result.data.logs);
                setPagination(result.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setError(err.response?.data?.message || 'Failed to load audit trail');
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setActionFilter('');
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAction = (action) => {
        const actionMap = {
            // Uppercase versions (legacy)
            'VIEW_MEDICAL_RECORD': 'Viewed Medical Record',
            'CREATE_MEDICAL_RECORD': 'Created Medical Record',
            'UPDATE_MEDICAL_RECORD': 'Updated Medical Record',
            'VIEW_PATIENT_RECORDS': 'Viewed Patient Records',
            'GRANT_CONSENT': 'Granted Consent',
            'REVOKE_CONSENT': 'Revoked Consent',
            'CREATE_DIAGNOSIS': 'Created Diagnosis',
            'CREATE_PRESCRIPTION': 'Created Prescription',
            'UPLOAD_LAB_RESULT': 'Uploaded Lab Result',
            'UPLOAD_IMAGING_REPORT': 'Uploaded Imaging Report',
            // Lowercase versions (current)
            'view_medical_record': 'Viewed Medical Record',
            'create_medical_record': 'Created Medical Record',
            'update_medical_record': 'Updated Medical Record',
            'view_patient_records': 'Viewed Patient Records',
            'consent_grant': 'Granted Consent',
            'consent_revoke': 'Revoked Consent',
            'consent_view': 'Viewed Consent',
            'consent_expired': 'Consent Expired',
            'create_diagnosis': 'Created Diagnosis',
            'create_prescription': 'Created Prescription',
            'upload_lab_result': 'Uploaded Lab Result',
            'upload_imaging_report': 'Uploaded Imaging Report',
            'user_login': 'User Login',
            'user_register': 'User Registration',
            // Visit Actions
            'create_visit': 'Requested Visit',
            'approve_visit': 'Visit Approved',
            'update_visit': 'Visit Updated',
            'verify_visit_otp': 'Verified Visit OTP',
            // Clinical Workflow Actions
            'create_lab_order': 'Ordered Lab Test',
            'create_imaging_order': 'Ordered Imaging',
            'create_medication_order': 'Prescribed Medication'
        };
        return actionMap[action] || action;
    };

    const getActionBadgeClass = (action) => {
        const baseClass = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ";
        if (action.includes('VIEW') || action.includes('view')) return baseClass + 'bg-blue-50 text-blue-700 border border-blue-100';
        if (action.includes('CREATE') || action.includes('UPLOAD') || action.includes('create') || action.includes('upload')) return baseClass + 'bg-green-50 text-green-700 border border-green-100';
        if (action.includes('UPDATE') || action.includes('update')) return baseClass + 'bg-yellow-50 text-yellow-700 border border-yellow-100';
        if (action.includes('REVOKE') || action.includes('revoke')) return baseClass + 'bg-red-50 text-red-700 border border-red-100';
        if (action.includes('GRANT') || action.includes('grant')) return baseClass + 'bg-purple-50 text-purple-700 border border-purple-100';
        return baseClass + 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="dashboard-container bg-slate-50 dark:bg-slate-900 min-h-screen">
            <header className="w-full bg-gradient-to-r from-[#3a8d9b] to-[#257582] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center bg-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide m-0">Audit Trail</h1>
                        <p className="text-white/80 text-xs mt-0.5 m-0 font-medium">See who accessed your medical records and when</p>
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
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-[#3a8d9b] focus:ring-1 focus:ring-[#3a8d9b] transition-colors outline-none text-sm"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-[#3a8d9b] focus:ring-1 focus:ring-[#3a8d9b] transition-colors outline-none text-sm"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Action Type</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-[#3a8d9b] focus:ring-1 focus:ring-[#3a8d9b] transition-colors outline-none text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="view_patient_records">Viewed Records</option>
                            <option value="consent_grant">Granted Consent</option>
                            <option value="consent_revoke">Revoked Consent</option>
                            <option value="consent_view">Viewed Consent</option>
                            <option value="create_visit">Requested Visit</option>
                            <option value="approve_visit">Visit Approved</option>
                            <option value="user_login">Login</option>
                        </select>
                    </div>
                    <div>
                        <button
                            className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-slate-600"
                            onClick={handleResetFilters}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading audit logs...</div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center">{error}</div>
                    ) : logs.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-lg m-0 mb-2">No audit logs found</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm m-0">Audit logs will appear here when someone accesses your medical records</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-400 transition-all p-5">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-lg border border-teal-100 flex-shrink-0">
                                                    {log.userRole === 'DOCTOR' ? '🩺' :
                                                        log.userRole === 'NURSE' ? '👨‍⚕️' :
                                                            log.userRole === 'PATIENT' ? '🧑' : '👤'}
                                                </div>
                                                <div>
                                                    <strong className="block text-gray-900 dark:text-white font-bold">
                                                        {log.userFirstName && log.userLastName
                                                            ? `${log.userFirstName} ${log.userLastName}`
                                                            : log.userEmail || 'Unknown User'}
                                                    </strong>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
                                                        {log.userRole || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className={getActionBadgeClass(log.action)}>
                                                    {formatAction(log.action)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Time</span>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(log.timestamp)}</span>
                                            </div>
                                            {log.purpose && (
                                                <div>
                                                    <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Purpose</span>
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{log.purpose}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {pagination.pages > 1 && (
                                <div className="flex justify-center items-center gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                                    <button
                                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                        Page {currentPage} of {pagination.pages} <span className="text-gray-400 dark:text-gray-500">({pagination.total} logs)</span>
                                    </span>
                                    <button
                                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === pagination.pages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuditTrail;
