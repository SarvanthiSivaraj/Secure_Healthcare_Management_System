import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import '../patient/Dashboard.css';

function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Admin Portal</h1>
                        <p className="header-subtitle">System Administration & User Management</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</div>
                        <div className="user-id">Role: System Administrator</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Full Access</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Active Doctors</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Registered Patients</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">System Alerts</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Administration</h2>

                    <div className="nav-grid">
                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>User Management</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Manage user accounts, roles, and access permissions across the system
                            </p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>Doctor Registration</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Register and verify healthcare providers and medical staff
                            </p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>System Audit Logs</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Review comprehensive system activity and security audit trails
                            </p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>System Settings</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Configure system parameters, security policies, and integrations
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
