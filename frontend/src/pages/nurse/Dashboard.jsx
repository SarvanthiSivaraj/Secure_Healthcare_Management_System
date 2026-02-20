import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import '../patient/Dashboard.css';

function NurseDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [shiftStatus] = useState('ON_DUTY'); // ON_DUTY, OFF_DUTY

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Nurse Portal</h1>
                        <p className="header-subtitle">Patient Care & Vitals Management</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{user?.firstName || 'Nurse'} {user?.lastName || 'Smith'}</div>
                        <div className="user-id">ID: {user?.staffId || 'NURSE-2024-001'}</div>
                        <PasskeySetupCard />
                    </div>
                    <div className="account-status">
                        <span className={`status-indicator ${shiftStatus === 'ON_DUTY' ? 'active' : ''}`}></span>
                        <span className="status-text">{shiftStatus === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Assigned Patients</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Vitals Recorded</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Care Tasks</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Observations</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Care Services</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/nurse/vitals')}>
                            <div className="nav-card-header">
                                <h3>📊 Record Vitals</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Record patient vital signs and physical measurements
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/nurse/patients')}>
                            <div className="nav-card-header">
                                <h3>👥 Assigned Patients</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                View and manage your assigned patient list
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/nurse/observations')}>
                            <div className="nav-card-header">
                                <h3>📝 Care Observations</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Document patient care observations and notes
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/nurse/medications')}>
                            <div className="nav-card-header">
                                <h3>💊 Medication Admin</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Track and document medication administration
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NurseDashboard;
