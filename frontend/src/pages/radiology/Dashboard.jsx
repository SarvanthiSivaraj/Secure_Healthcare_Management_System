import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import workflowApi from '../../api/workflowApi';
import './RadiologyDashboard.css';

/* ── Inline SVG Icons (matching admin/doctor portal style) ── */
const IconMonitor = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);
const IconClipboard = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
);
const IconActivity = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const IconCheckCircle = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IconAlertTriangle = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const IconFolder = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);
const IconUpload = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const IconImage = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
);
const IconZap = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const IconShield = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconMoon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

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
            icon: <IconFolder />,
            title: 'Imaging Queue',
            desc: 'View and process assigned imaging study requests',
            path: '/radiology/queue',
        },
        {
            icon: <IconUpload />,
            title: 'Upload Reports',
            desc: 'Upload diagnostic imaging reports linked to patient visits',
            path: '/radiology/upload',
        },
        {
            icon: <IconImage />,
            title: 'DICOM Viewer',
            desc: 'View and annotate medical imaging studies (DICOM)',
            path: '/radiology/viewer',
        },
        {
            icon: <IconZap />,
            title: 'STAT Orders',
            desc: 'Urgent imaging requests requiring immediate attention',
            path: '/radiology/queue?priority=stat',
        },
    ];

    const statCards = [
        { icon: <IconClipboard />, label: 'Pending Reads', value: stats.pendingReads, className: '' },
        { icon: <IconActivity />, label: 'In Progress', value: stats.inProgress, className: '' },
        { icon: <IconCheckCircle />, label: 'Completed Today', value: stats.completedToday, className: '' },
        { icon: <IconAlertTriangle />, label: 'Priority Cases', value: stats.priorityCases, className: 'priority' },
    ];

    return (
        <div className="rad-dashboard-container">
            {/* ── Header ── */}
            <header className="rad-header">
                <div className="rad-header-content">
                    <div className="rad-header-brand">
                        <div className="rad-header-icon">
                            <IconMonitor />
                        </div>
                        <div>
                            <h1>Radiologist Portal</h1>
                            <p className="rad-header-subtitle">Medical Imaging &amp; Diagnostic Reports</p>
                        </div>
                    </div>
                    <div className="rad-header-actions">
                        <button className="rad-theme-btn" title="Toggle theme">
                            <IconMoon />
                        </button>
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
                            License: {user?.licenseNumber || 'RAD-2024-001'}
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
                        <IconShield />
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
