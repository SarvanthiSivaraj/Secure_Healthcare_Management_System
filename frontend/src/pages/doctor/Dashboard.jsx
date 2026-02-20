import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import EmergencyToggle from '../../components/emergency/EmergencyToggle';
import '../patient/Dashboard.css';

function DoctorDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [emergencyMode, setEmergencyMode] = useState(false);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Doctor Portal</h1>
                        <p className="header-subtitle">Patient Care & Medical Records Management</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">Dr. {user?.firstName || 'Sarah'} {user?.lastName || 'Johnson'}</div>
                        <div className="user-id">License: {user?.licenseNumber || 'MD-2024-789456'}</div>
                        <PasskeySetupCard />
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Active Physician</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Today's Patients</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Pending Consents</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Active Cases</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Consultations</div>
                    </div>
                </div>

                {/* Emergency Access */}
                <div className="nav-section">
                    <h2 className="section-title">Emergency Access</h2>
                    <EmergencyToggle
                        isActive={emergencyMode}
                        onToggle={setEmergencyMode}
                    />
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Clinical Services</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/doctor/patients')}>
                            <div className="nav-card-header">
                                <h3>Patient Records</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Access and manage patient medical records with consent verification
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/active-visits')}>
                            <div className="nav-card-header">
                                <h3>Consultation Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                View scheduled appointments and manage consultation workflow
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/consent')}>
                            <div className="nav-card-header">
                                <h3>Consent Requests</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Review and manage patient data access consent requests
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/notes')}>
                            <div className="nav-card-header">
                                <h3>Clinical Notes</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Create and update patient consultation notes and prescriptions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;
