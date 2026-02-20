import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import '../patient/Dashboard.css';

function RadiologistDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Radiologist Portal</h1>
                        <p className="header-subtitle">Medical Imaging & Diagnostic Reports</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">Dr. {user?.firstName || 'Radiologist'} {user?.lastName || 'Williams'}</div>
                        <div className="user-id">License: {user?.licenseNumber || 'RAD-2024-789'}</div>
                        <PasskeySetupCard />
                    </div>
                    <div className="account-status">
                        <span className="status-indicator active"></span>
                        <span className="status-text">Active Radiologist</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Pending Reads</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Completed Today</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Priority Cases</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Imaging Services</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/radiology/queue')}>
                            <div className="nav-card-header">
                                <h3>🏥 Imaging Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                View and manage assigned imaging study requests
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/radiology/upload')}>
                            <div className="nav-card-header">
                                <h3>📤 Upload Reports</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Upload imaging reports and diagnostic findings
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/radiology/viewer')}>
                            <div className="nav-card-header">
                                <h3>🖼️ DICOM Viewer</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                View and analyze medical imaging studies
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/radiology/stat')}>
                            <div className="nav-card-header">
                                <h3>⚡ Stat Orders</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Urgent imaging requests requiring immediate attention
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RadiologistDashboard;
