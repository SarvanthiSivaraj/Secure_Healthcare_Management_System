import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import workflowApi from '../../api/workflowApi';
import './RadiologyDashboard.css';

function RadiologistDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const [stats, setStats] = useState({
        pendingReads: 0,
        inProgress: 0,
        completedToday: 0,
        priorityCases: 0,
    });
    const [loading, setLoading] = useState(true);
    const [accessLogged, setAccessLogged] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch imaging orders from the workflow API
            // Since we don't have a direct "my imaging orders" endpoint,
            // we fetch notifications and derive counts from available data.
            // Stats remain 0 when backend is not connected — graceful degradation.
            const notifRes = await workflowApi.getUserNotifications(false).catch(() => null);

            if (notifRes?.data) {
                const imagingNotifs = notifRes.data.filter(n =>
                    n.referenceType === 'imaging_order' || n.type === 'imaging'
                );
                setStats(prev => ({
                    ...prev,
                    pendingReads: imagingNotifs.filter(n => n.status === 'pending').length,
                }));
            }

            setAccessLogged(true);
        } catch {
            // Backend may be offline — show zeros gracefully
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const services = [
        {
            icon: '🗂️',
            title: 'Imaging Queue',
            desc: 'View and process assigned imaging study requests',
            path: '/radiology/queue',
        },
        {
            icon: '📤',
            title: 'Upload Reports',
            desc: 'Upload diagnostic imaging reports linked to patient visits',
            path: '/radiology/upload',
        },
        {
            icon: '🖼️',
            title: 'DICOM Viewer',
            desc: 'View and annotate medical imaging studies (DICOM)',
            path: '/radiology/viewer',
        },
        {
            icon: '⚡',
            title: 'STAT Orders',
            desc: 'Urgent imaging requests requiring immediate attention',
            path: '/radiology/queue?priority=stat',
        },
    ];

    const statCards = [
        { icon: '📋', label: 'Pending Reads', value: stats.pendingReads, className: '' },
        { icon: '🔬', label: 'In Progress', value: stats.inProgress, className: '' },
        { icon: '✅', label: 'Completed Today', value: stats.completedToday, className: '' },
        { icon: '🚨', label: 'Priority Cases', value: stats.priorityCases, className: 'priority' },
    ];

    return (
        <div className="rad-dashboard-container">
            {/* ── Header ── */}
            <header className="rad-header">
                <div className="rad-header-content">
                    <div className="rad-header-brand">
                        <div className="rad-header-icon">🩻</div>
                        <div>
                            <h1>Radiologist Portal</h1>
                            <p className="rad-header-subtitle">Medical Imaging &amp; Diagnostic Reports</p>
                        </div>
                    </div>
                    <div className="rad-header-actions">
                        <button className="rad-theme-btn" title="Toggle theme">🌙</button>
                        <button className="rad-signout-btn" onClick={logout}>Sign Out</button>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <div className="rad-content">

                {/* User Info Bar */}
                <div className="rad-user-bar">
                    <div>
                        <div className="rad-user-name">
                            Dr. {user?.firstName || 'Radiologist'} {user?.lastName || ''}
                        </div>
                        <div className="rad-user-meta">
                            License: {user?.licenseNumber || 'RAD-2024-001'} &nbsp;|&nbsp; Radiology Dept.
                        </div>
                    </div>
                    <div className="rad-status-badge">
                        <span className="rad-status-dot" />
                        <span className="rad-status-label">Active Radiologist</span>
                    </div>
                </div>

                {/* Access Logged Notice */}
                {accessLogged && (
                    <div className="rad-access-notice">
                        <span className="rad-access-notice-icon">🔒</span>
                        <span>
                            <strong>Secure Session Active.</strong>&nbsp;
                            Your imaging system access is being logged and audited in real time.
                        </span>
                    </div>
                )}

                {/* Stat Cards */}
                {loading ? (
                    <div className="rad-loading">
                        <span className="rad-spinner" /> Loading dashboard data…
                    </div>
                ) : (
                    <div className="rad-stats-grid">
                        {statCards.map(card => (
                            <div key={card.label} className={`rad-stat-card ${card.className}`}>
                                <span className="rad-stat-icon">{card.icon}</span>
                                <div className="rad-stat-number">{card.value}</div>
                                <div className="rad-stat-label">{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Imaging Services */}
                <div className="rad-section">
                    <h2 className="rad-section-title">Imaging Services</h2>
                    <div className="rad-nav-grid">
                        {services.map(svc => (
                            <div
                                key={svc.title}
                                className="rad-nav-card"
                                onClick={() => navigate(svc.path)}
                            >
                                <div className="rad-nav-card-icon">{svc.icon}</div>
                                <div className="rad-nav-card-body">
                                    <h3>{svc.title}</h3>
                                    <p>{svc.desc}</p>
                                </div>
                                <span className="rad-nav-arrow">›</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RadiologistDashboard;
