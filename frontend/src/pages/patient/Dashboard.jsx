import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './Dashboard.css';

function PatientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Patient Portal</h1>
                        <p className="header-subtitle">Healthcare Data Management</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{user?.firstName || 'John'} {user?.lastName || 'Doe'}</div>
                        <div className="user-id">ID: {user?.uniqueHealthId || 'UHI-20260203-123456'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Active Account</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Active Consents</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Medical Records</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Scheduled Visits</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Access Logs</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Services</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/patient/consent')}>
                            <div className="nav-card-header">
                                <h3>Consent Management</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Control data access permissions and manage healthcare provider consents
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/patient/medical-records')}>
                            <div className="nav-card-header">
                                <h3>Medical Records</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Access your complete medical history and consultation records
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/patient/visits')}>
                            <div className="nav-card-header">
                                <h3>Visit Management</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Schedule appointments and manage upcoming healthcare visits
                            </p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-header">
                                <h3>Audit Trail</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Review detailed logs of all data access and system activities
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;