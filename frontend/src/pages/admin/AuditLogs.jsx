import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { getToken } from '../../utils/tokenManager'; // Import token manager
import './AuditLogs.css';

function AuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken(); // Use correct token retrieval method

            // Fetch real audit logs from backend
            const response = await fetch('http://localhost:5000/api/audit/logs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                setLogs([]);
                setError('Session expired. Please log in again.');
                return;
            } /* else if (response.status === 403) ... */

            if (response.status === 403) {
                setError('Access Denied: You do not have permission to view audit logs.');
                setLogs([]);
                return;
            }

            const data = await response.json();

            if (data.success) {
                setLogs(data.data);
            } else {
                setError(data.message || 'Failed to fetch logs');
                setLogs([]);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setError('Failed to connect to the server');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = filterAction === 'all' || log.action === filterAction;

        let matchesDate = true;
        if (dateRange.start) {
            matchesDate = matchesDate && new Date(log.timestamp) >= new Date(dateRange.start);
        }
        if (dateRange.end) {
            matchesDate = matchesDate && new Date(log.timestamp) <= new Date(dateRange.end);
        }

        return matchesSearch && matchesAction && matchesDate;
    });

    const getActionBadgeClass = (action) => {
        const actionMap = {
            'visit_approval': 'badge-success',
            'consent_grant': 'badge-info',
            'emr_access': 'badge-warning',
            'staff_onboard': 'badge-primary',
            'user_login': 'badge-neutral',
            'user_logout': 'badge-neutral',
            'staff_deactivate': 'badge-danger',
            'create_visit': 'badge-info',
            'approve_visit': 'badge-success',
            'update_visit': 'badge-warning',
            'verify_visit_otp': 'badge-success',
            'create_lab_order': 'badge-primary',
            'create_imaging_order': 'badge-primary',
            'create_medication_order': 'badge-primary',
            'create_medical_record': 'badge-info',
            'view_medical_record': 'badge-neutral'
        };
        return actionMap[action] || 'badge-default';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>System Audit Logs</h1>
                        <p className="header-subtitle">Comprehensive system activity and security audit trails</p>
                    </div>
                    <Button onClick={() => navigate('/admin/dashboard')} variant="secondary">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Search and Filters */}
                <div className="filters-container">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by user, action, or details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Actions</option>
                            <option value="user_login">User Login</option>
                            <option value="create_visit">Requested Visit</option>
                            <option value="approve_visit">Visit Approved</option>
                            <option value="create_medical_record">Created Record</option>
                            <option value="view_medical_record">Viewed Record</option>
                            <option value="visit_approval">Visit Approval (Legacy)</option>
                            <option value="consent_grant">Consent Grant</option>
                            <option value="emr_access">EMR Access</option>
                            <option value="staff_onboard">Staff Onboard</option>
                            <option value="staff_deactivate">Staff Deactivate</option>
                        </select>

                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="date-input"
                            placeholder="Start Date"
                        />

                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="date-input"
                            placeholder="End Date"
                        />

                        {(searchTerm || filterAction !== 'all' || dateRange.start || dateRange.end) && (
                            <Button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterAction('all');
                                    setDateRange({ start: '', end: '' });
                                }}
                                variant="outline"
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="logs-table-container">
                    {loading ? (
                        <p className="loading">Loading audit logs...</p>
                    ) : error ? (
                        <div className="error-message" style={{ textAlign: 'center', color: '#e53e3e', padding: '2rem' }}>
                            <p>{error}</p>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>
                                Please ensure you are logged in as an administrator.
                            </p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <p className="no-data">No audit logs found</p>
                    ) : (
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Details</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="timestamp-cell">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="user-cell">{log.user_email}</td>
                                        <td>
                                            <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                                                {log.action?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="resource-text">
                                                {log.resource}
                                            </span>
                                        </td>
                                        <td className="details-cell">{log.details}</td>
                                        <td className="ip-cell">{log.ip_address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>




            </div>
        </div>
    );
}

export default AuditLogs;
