import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import '../patient/Dashboard.css';

function LabDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const displayName = `${user?.firstName || 'Lab'} ${user?.lastName || 'Technician'}`.trim();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Lab Technician Portal</h1>
                        <p className="header-subtitle">Sample processing, result readiness, and urgent case handling</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || 'LAB-2024-001'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator active"></span>
                        <span className="status-text">Available</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">14</div>
                        <div className="stat-label">Pending Tests</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">5</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">22</div>
                        <div className="stat-label">Completed Today</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">2</div>
                        <div className="stat-label">Urgent Samples</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Laboratory Actions</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header">
                                <h3>Test Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Open assigned visit requests and prioritize samples
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header">
                                <h3>Workflow Board</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Update sample stages and handoff status
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/dashboard')}>
                            <div className="nav-card-header">
                                <h3>Staff Operations</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Access registration and cross-team task support
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/active-visits')}>
                            <div className="nav-card-header">
                                <h3>Critical Visit Watch</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Monitor high-risk active visits requiring rapid turnaround
                            </p>
                        </div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Test Request Queue</h2>
                    <div className="dashboard-panel">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Priority</th>
                                    <th>Patient ID</th>
                                    <th>Visit ID</th>
                                    <th>Test</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>STAT</td>
                                    <td>P-78211</td>
                                    <td>V-3421</td>
                                    <td>Troponin</td>
                                    <td>Processing</td>
                                </tr>
                                <tr>
                                    <td>Routine</td>
                                    <td>P-78212</td>
                                    <td>V-3422</td>
                                    <td>CBC</td>
                                    <td>Received</td>
                                </tr>
                                <tr>
                                    <td>Routine</td>
                                    <td>P-78213</td>
                                    <td>V-3423</td>
                                    <td>LFT</td>
                                    <td>In transit</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Sample Flow & Processing</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Sample Tracking</h3>
                            <div className="pill-row">
                                <span className="status-pill">Collected</span>
                                <span className="status-pill">In transit</span>
                                <span className="status-pill">Received</span>
                                <span className="status-pill">Processing</span>
                                <span className="status-pill">Completed</span>
                            </div>
                            <p className="readonly-note">Barcode scan integration: ready for LIS connector.</p>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Test Processing Panel</h3>
                            <ul className="data-list">
                                <li>Enter test results</li>
                                <li>Upload lab reports</li>
                                <li>Attach supporting files</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Result Verification</h3>
                            <ul className="data-list">
                                <li>Senior technician validation required before release</li>
                                <li>Results lock after submission (immutable)</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">History View</h3>
                            <ul className="data-list">
                                <li>Previous tests shown for same patient</li>
                                <li>Context limited to lab-relevant clinical data</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Communication, Consent & Audit</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Communication Panel</h3>
                            <ul className="data-list">
                                <li>Query doctor for test clarification</li>
                                <li>Mark insufficient sample</li>
                                <li>Request sample retest</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Consent & Access Guardrails</h3>
                            <ul className="data-list">
                                <li>Only test-related data visible</li>
                                <li>No full EMR access</li>
                                <li>No doctor notes visibility</li>
                                <li>No billing data visibility</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Audit Capture</h3>
                            <ul className="data-list">
                                <li>Uploader identity, role, and timestamp logged</li>
                                <li>Verification and lock events logged</li>
                                <li>Modification attempts logged with denial reason</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <GovernancePanel roleLabel="lab technician" scopeLabel="Treatment → Labs only" />
            </div>
        </div>
    );
}

export default LabDashboard;
