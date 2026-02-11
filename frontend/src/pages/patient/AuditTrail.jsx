import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auditApi from '../../api/auditApi';
import Button from '../../components/common/Button';
import './AuditTrail.css';

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
            'user_register': 'User Registration'
        };
        return actionMap[action] || action;
    };

    const getActionBadgeClass = (action) => {
        if (action.includes('VIEW')) return 'action-badge view';
        if (action.includes('CREATE') || action.includes('UPLOAD')) return 'action-badge create';
        if (action.includes('UPDATE')) return 'action-badge update';
        if (action.includes('REVOKE')) return 'action-badge revoke';
        if (action.includes('GRANT')) return 'action-badge grant';
        return 'action-badge';
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="audit-trail-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>🔍 Audit Trail</h1>
                    <p className="page-subtitle">
                        See who accessed your medical records and when
                    </p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" onClick={() => navigate('/patient/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <div className="audit-filters">
                <div className="filter-group">
                    <label>Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="filter-input"
                    />
                </div>
                <div className="filter-group">
                    <label>End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="filter-input"
                    />
                </div>
                <div className="filter-group">
                    <label>Action Type</label>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Actions</option>
                        <option value="view_patient_records">Viewed Records</option>
                        <option value="consent_grant">Granted Consent</option>
                        <option value="consent_revoke">Revoked Consent</option>
                        <option value="consent_view">Viewed Consent</option>
                        <option value="user_login">Login</option>
                    </select>
                </div>
                <div className="filter-actions">
                    <Button variant="secondary" size="small" onClick={handleResetFilters}>
                        Reset Filters
                    </Button>
                </div>
            </div>

            <div className="page-content">
                {loading ? (
                    <div className="loading-state">Loading audit logs...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <p>📋 No audit logs found</p>
                        <small>Audit logs will appear here when someone accesses your medical records</small>
                    </div>
                ) : (
                    <>
                        <div className="audit-timeline">
                            {logs.map((log) => (
                                <div key={log.id} className="audit-log-card">
                                    <div className="log-header">
                                        <div className="log-user">
                                            <span className="user-icon">
                                                {log.userRole === 'DOCTOR' ? '🩺' :
                                                    log.userRole === 'NURSE' ? '👨‍⚕️' :
                                                        log.userRole === 'PATIENT' ? '🧑' : '👤'}
                                            </span>
                                            <div className="user-details">
                                                <strong>
                                                    {log.userFirstName && log.userLastName
                                                        ? `${log.userFirstName} ${log.userLastName}`
                                                        : log.userEmail || 'Unknown User'}
                                                </strong>
                                                <span className="user-role">
                                                    {log.userRole || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={getActionBadgeClass(log.action)}>
                                            {formatAction(log.action)}
                                        </span>
                                    </div>
                                    <div className="log-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Time:</span>
                                            <span className="detail-value">{formatDate(log.timestamp)}</span>
                                        </div>
                                        {log.purpose && (
                                            <div className="detail-item">
                                                <span className="detail-label">Purpose:</span>
                                                <span className="detail-value">{log.purpose}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="pagination-controls">
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="page-info">
                                    Page {currentPage} of {pagination.pages} ({pagination.total} logs)
                                </span>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AuditTrail;
