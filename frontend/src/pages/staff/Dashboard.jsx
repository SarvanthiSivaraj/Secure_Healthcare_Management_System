import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import '../patient/Dashboard.css';

function StaffDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Staff Portal</h1>
                        <p className="header-subtitle">Patient Registration & Visit Management</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{user?.firstName || 'Staff'} {user?.lastName || 'Member'}</div>
                        <div className="user-id">ID: {user?.staffId || 'STAFF-2024-001'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">On Duty</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Today's Check-ins</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Pending Visits</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">New Registrations</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Completed Today</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Operations</h2>

                    <div className="nav-grid">
                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>Patient Check-in</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Process patient arrivals and verify appointment information
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header">
                                <h3>Visit Management</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Track and manage patient visits and consultation queue
                            </p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>Patient Registration</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Register new patients and update demographic information
                            </p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>Appointment Scheduling</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Schedule and manage patient appointments with doctors
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffDashboard;
