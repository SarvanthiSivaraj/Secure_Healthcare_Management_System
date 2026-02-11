import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import './AuditLogs.css';

function AuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch real audit logs from backend
            const response = await fetch('http://localhost:5000/api/audit/logs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                // Token might be expired
                return;
            }

            const data = await response.json();

            if (data.success) {
                setLogs(data.data);
            } else {
                console.error('Failed to fetch logs:', data.message);
                // Fallback to empty list or handle error
                setLogs([]);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            // Fallback to empty list
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
            'staff_deactivate': 'badge-danger'
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
                            <option value="visit_approval">Visit Approval</option>
                            <option value="consent_grant">Consent Grant</option>
                            <option value="emr_access">EMR Access</option>
                            <option value="staff_onboard">Staff Onboard</option>
                            <option value="user_login">User Login</option>
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
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="logs-table-container">
                    {loading ? (
                        <p className="loading">Loading audit logs...</p>
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

                {/* Stats Summary */}
                <div className="audit-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{filteredLogs.length}</div>
                            <div className="stat-label">Total Events</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <div className="stat-value">{new Set(filteredLogs.map(l => l.user_email)).size}</div>
                            <div className="stat-label">Unique Users</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-info">
                            <div className="stat-value">Last 24h</div>
                            <div className="stat-label">Time Range</div>
                        </div>
                    </div>
                </div>

                <div className="info-banner">
                    <strong>ℹ️ Note:</strong> Currently displaying mock data. Connect to audit backend API for live logs.
                </div>
            </div>
        </div>
    );
}

export default AuditLogs;
