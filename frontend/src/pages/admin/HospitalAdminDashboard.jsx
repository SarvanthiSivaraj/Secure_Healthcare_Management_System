import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './HospitalAdminDashboard.css';

function HospitalAdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStaff: 0,
        activeDoctors: 0,
        pendingVisits: 0,
        totalPatients: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/v1/admin/hospital/stats');
                const data = response.data;
                if (data.success) setStats(data.data);
            } catch (err) {
                console.error('Failed to fetch hospital stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="ha-container">

            {/* ── Header ── */}
            <header className="ha-header">
                <div className="ha-header-inner">
                    <div className="ha-header-left">
                        <div className="ha-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </div>
                        <div className="ha-header-text">
                            <h1 className="ha-header-title">Hospital Admin Dashboard</h1>
                            <p className="ha-header-subtitle">Hospital Administration & Staff Management</p>
                        </div>
                    </div>
                    <div className="ha-header-right">
                        <button className="ha-header-theme-toggle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        </button>
                        <button className="ha-header-signout" onClick={logout}>Sign Out</button>
                    </div>
                </div>
            </header>

            {/* ── Page Content ── */}
            <div className="ha-content">

                {/* User Info Bar */}
                <div className="ha-info-bar">
                    <div className="ha-user-details">
                        <div className="ha-user-name">
                            {user?.firstName || 'System'} {user?.lastName || 'Admin'}
                        </div>
                        <div className="ha-user-role">Role: Hospital Administrator</div>
                    </div>
                    <div className="ha-status-pill">
                        <span className="ha-status-dot"></span>
                        Full Access
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="ha-stats-grid">
                    <div className="ha-stat">
                        <div className="ha-stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="ha-stat-num">{statsLoading ? '—' : stats.totalStaff}</div>
                        <div className="ha-stat-lbl">TOTAL STAFF</div>
                    </div>
                    <div className="ha-stat">
                        <div className="ha-stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                        </div>
                        <div className="ha-stat-num">{statsLoading ? '—' : stats.activeDoctors}</div>
                        <div className="ha-stat-lbl">ACTIVE DOCTORS</div>
                    </div>
                    <div className="ha-stat">
                        <div className="ha-stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <div className="ha-stat-num">{statsLoading ? '—' : stats.pendingVisits}</div>
                        <div className="ha-stat-lbl">PENDING VISITS</div>
                    </div>
                    <div className="ha-stat">
                        <div className="ha-stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </div>
                        <div className="ha-stat-num">{statsLoading ? '—' : stats.totalPatients}</div>
                        <div className="ha-stat-lbl">TOTAL PATIENTS</div>
                    </div>
                </div>

                {/* Nav Section */}
                <div className="ha-nav-section">
                    <h2 className="ha-section-title">Hospital Administration</h2>
                    <div className="ha-nav-grid">

                        <div className="ha-nav-card" onClick={() => navigate('/admin/staff')}>
                            <div className="ha-nav-card-main">
                                <div className="ha-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div className="ha-nav-text">
                                    <h3>Staff Management</h3>
                                    <p>Invite staff members and manage staff invitations across the organisation</p>
                                </div>
                            </div>
                            <span className="ha-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </span>
                        </div>


                        <div className="ha-nav-card" onClick={() => navigate('/admin/visits')}>
                            <div className="ha-nav-card-main">
                                <div className="ha-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                </div>
                                <div className="ha-nav-text">
                                    <h3>Visit Management</h3>
                                    <p>View and manage patient visit requests, approve visits and assign staff</p>
                                </div>
                            </div>
                            <span className="ha-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </span>
                        </div>

                        <div className="ha-nav-card" onClick={() => navigate('/admin/users')}>
                            <div className="ha-nav-card-main">
                                <div className="ha-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                </div>
                                <div className="ha-nav-text">
                                    <h3>User Management</h3>
                                    <p>Manage user accounts, roles and access permissions within your organisation</p>
                                </div>
                            </div>
                            <span className="ha-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </span>
                        </div>

                        <div className="ha-nav-card" onClick={() => navigate('/admin/audit-logs')}>
                            <div className="ha-nav-card-main">
                                <div className="ha-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                </div>
                                <div className="ha-nav-text">
                                    <h3>Audit Logs</h3>
                                    <p>Review comprehensive system activity and security audit trails</p>
                                </div>
                            </div>
                            <span className="ha-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default HospitalAdminDashboard;
