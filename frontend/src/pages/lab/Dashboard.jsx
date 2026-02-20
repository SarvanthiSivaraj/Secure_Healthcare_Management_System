import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import '../patient/Dashboard.css';

function LabDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Lab Technician Portal</h1>
                        <p className="header-subtitle">Laboratory Testing & Results Management</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{user?.firstName || 'Lab Tech'} {user?.lastName || 'Johnson'}</div>
                        <div className="user-id">ID: {user?.staffId || 'LAB-2024-001'}</div>
                        <PasskeySetupCard />
                    </div>
                    <div className="account-status">
                        <span className="status-indicator active"></span>
                        <span className="status-text">Active</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Pending Tests</div>
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
                        <div className="stat-label">Total Tests</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Laboratory Services</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/lab/queue')}>
                            <div className="nav-card-header">
                                <h3>🔬 Test Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                View and manage assigned laboratory test requests
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/lab/upload')}>
                            <div className="nav-card-header">
                                <h3>📤 Upload Results</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Upload completed test results and reports
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/lab/history')}>
                            <div className="nav-card-header">
                                <h3>📊 Test History</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Review completed tests and historical data
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/lab/priority')}>
                            <div className="nav-card-header">
                                <h3>⚠️ Priority Cases</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Urgent and stat laboratory test requests
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LabDashboard;