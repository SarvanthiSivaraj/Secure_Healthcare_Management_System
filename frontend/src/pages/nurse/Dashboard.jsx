import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import '../patient/Dashboard.css';

function NurseDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const displayName = `${user?.firstName || 'Nurse'} ${user?.lastName || ''}`.trim();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Nurse Portal</h1>
                        <p className="header-subtitle">Care coordination, bedside updates, and clinical workflow</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* User Info Bar */}
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || 'NURSE-2024-001'}</div>
                        <PasskeySetupCard />
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">On Duty</span>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">12</div>
                        <div className="stat-label">Assigned Patients</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">9</div>
                        <div className="stat-label">Vitals Updated</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">4</div>
                        <div className="stat-label">Pending Tasks</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">3</div>
                        <div className="stat-label">Priority Cases</div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="nav-section">
                    <h2 className="section-title">Nursing Actions</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header">
                                <h3>Visit Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Open active visits and update bedside task progress
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header">
                                <h3>Clinical Workflow</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Coordinate handoffs, beds, and care checkpoints
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/active-visits')}>
                            <div className="nav-card-header">
                                <h3>Active Patient Status</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Monitor active treatment flow and time-sensitive cases
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/dashboard')}>
                            <div className="nav-card-header">
                                <h3>General Staff Tools</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Access registration and operational support modules
                            </p>
                        </div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Patient Care Queue</h2>
                    <div className="dashboard-panel">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Visit</th>
                                    <th>Shift</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>A. Thomas</td>
                                    <td>V-3421</td>
                                    <td>Day</td>
                                    <td>Critical, medication due</td>
                                    <td>Inpatient</td>
                                </tr>
                                <tr>
                                    <td>R. Sharma</td>
                                    <td>V-3422</td>
                                    <td>Day</td>
                                    <td>Post-op</td>
                                    <td>Inpatient</td>
                                </tr>
                                <tr>
                                    <td>M. Ali</td>
                                    <td>V-3423</td>
                                    <td>Day</td>
                                    <td>Medication due</td>
                                    <td>Outpatient</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Patient Snapshot & Vitals</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Patient Snapshot View</h3>
                            <ul className="data-list">
                                <li>Demographics: A. Thomas, 58, Male</li>
                                <li>Assigned Doctor: Dr. Emily Davis</li>
                                <li>Ward/Bed: Ward C / Bed 12</li>
                                <li>Visit Status: In consultation follow-up</li>
                                <li>Consent Status: Active (Treatment, Nursing, Labs)</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Vitals Management</h3>
                            <ul className="data-list">
                                <li>BP: 146/92 mmHg</li>
                                <li>Pulse: 108 bpm</li>
                                <li>Temperature: 99.8°F</li>
                                <li>SpO₂: 93%</li>
                                <li>Trend Graphs: Last 24h trend available</li>
                                <li>Abnormal Alert: BP and Pulse above target</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Care Notes, Medication & Tasks</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Care Notes</h3>
                            <ul className="data-list">
                                <li>Nursing observations</li>
                                <li>Wound care notes</li>
                                <li>Medication administration notes</li>
                            </ul>
                            <p className="readonly-note">Submitted notes are immutable (read-only after submission).</p>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Medication Administration</h3>
                            <ul className="data-list">
                                <li>Doctor prescriptions visible in read-only mode</li>
                                <li>Dose timing reminders with overdue markers</li>
                                <li>Administration actions: Mark administered or missed</li>
                                <li>No prescription edits allowed</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Task Panel</h3>
                            <div className="pill-row">
                                <span className="status-pill">Sample collection · In progress</span>
                                <span className="status-pill">Dressing change · Pending</span>
                                <span className="status-pill">Monitoring order · Due in 20m</span>
                            </div>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Alerts & Notifications</h3>
                            <ul className="data-list">
                                <li>Doctor instruction updated for V-3421</li>
                                <li>Lab results available for V-3422</li>
                                <li>Emergency escalation: Bedside response requested</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Access Governance Layer</h2>
                    <div className="dashboard-panel">
                        <ul className="data-list">
                            <li>Access allowed only during active shift and assigned visits</li>
                            <li>Restricted data: insurance, research data, unrelated patient notes</li>
                            <li>Role scope enforced: nurse treatment context only</li>
                        </ul>
                    </div>
                </section>

                <GovernancePanel roleLabel="nurse" scopeLabel="Treatment → Nursing & Labs only" />
            </div>
        </div>
    );
}

export default NurseDashboard;
