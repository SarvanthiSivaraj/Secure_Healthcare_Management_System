import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './Dashboard.css';


function PatientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [showHealthId, setShowHealthId] = useState(false);

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
                        <div className="user-name">{user?.firstName || 'Patient'} {user?.lastName || ''}</div>
                        <div className="user-id-container">
                            <span className="user-id-label">ID: </span>
                            <span className="user-id-value">
                                {showHealthId
                                    ? (user?.id || 'Not Assigned')
                                    : '••••-••••-••••'}
                            </span>
                            <button
                                className="toggle-id-btn"
                                onClick={() => setShowHealthId(!showHealthId)}
                                title={showHealthId ? "Hide ID" : "Show ID"}
                                aria-label={showHealthId ? "Hide Health ID" : "Show Health ID"}
                            >
                                {showHealthId ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
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

                        <div className="nav-card" onClick={() => navigate('/patient/audit-trail')}>
                            <div className="nav-card-header">
                                <h3>🔍 Audit Trail</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                See who accessed your medical records and when
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;