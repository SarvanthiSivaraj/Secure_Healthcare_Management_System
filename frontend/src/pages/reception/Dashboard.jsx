import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import '../patient/Dashboard.css';

function ReceptionDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const displayName = `${user?.firstName || 'Reception'} ${user?.lastName || 'Staff'}`.trim();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Reception Portal</h1>
                        <p className="header-subtitle">Front-desk check-in, queue management, and patient flow</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || 'RECP-2024-001'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Desk Open</span>
                    </div>
                </div>

                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">31</div>
                        <div className="stat-label">Check-ins Today</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">8</div>
                        <div className="stat-label">Waiting Patients</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">6</div>
                        <div className="stat-label">New Registrations</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">4</div>
                        <div className="stat-label">Priority Arrivals</div>
                    </div>
                </div>

                <div className="nav-section">
                    <h2 className="section-title">Reception Actions</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header">
                                <h3>Patient Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Check in patients, confirm arrivals, and route to care teams
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/dashboard')}>
                            <div className="nav-card-header">
                                <h3>Registration Desk</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Access patient registration and demographic update tools
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header">
                                <h3>Operational Workflow</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Coordinate handoffs with nursing, lab, and pharmacy teams
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/active-visits')}>
                            <div className="nav-card-header">
                                <h3>Live Visit Tracking</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                View active consultations to keep waiting flow predictable
                            </p>
                        </div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Patient Check-in & Appointments</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Patient Check-in Panel</h3>
                            <ul className="data-list">
                                <li>Scan OTP code</li>
                                <li>Scan QR token</li>
                                <li>Verify ID details</li>
                                <li>Create visit and route to queue</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Appointment Management</h3>
                            <ul className="data-list">
                                <li>Schedule new appointments</li>
                                <li>Reschedule slots</li>
                                <li>Cancel appointments</li>
                                <li>Assign doctor by availability</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Registration & Visit Lifecycle</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Patient Registration</h3>
                            <ul className="data-list">
                                <li>Create patient profile</li>
                                <li>Verify identity (OTP/Aadhaar/ID)</li>
                                <li>Upload supporting documents</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Visit Lifecycle</h3>
                            <div className="pill-row">
                                <span className="status-pill">Check-in</span>
                                <span className="status-pill">Waiting</span>
                                <span className="status-pill">In consultation</span>
                                <span className="status-pill">Admitted</span>
                                <span className="status-pill">Discharged</span>
                            </div>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Queue Management</h3>
                            <ul className="data-list">
                                <li>Waiting room live list</li>
                                <li>Doctor load balancing assistance</li>
                                <li>Priority tagging for urgent arrivals</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Minimal Patient View</h3>
                            <ul className="data-list">
                                <li>Name, age, contact</li>
                                <li>Visit history summary</li>
                                <li>No clinical records exposed</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Billing & Access Governance</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Billing Initiation (Limited)</h3>
                            <ul className="data-list">
                                <li>Generate visit token</li>
                                <li>Forward case to billing department</li>
                                <li>Insurance flag marking only</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Access Governance</h3>
                            <ul className="data-list">
                                <li>Cannot access diagnoses</li>
                                <li>Cannot access prescriptions</li>
                                <li>Cannot access lab reports</li>
                                <li>Cannot access treatment plans</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Alerts</h3>
                            <ul className="data-list">
                                <li>Doctor availability change</li>
                                <li>Patient no-show detection</li>
                                <li>Emergency arrival notification</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <GovernancePanel roleLabel="receptionist" scopeLabel="Operations → Registration & Scheduling only" />
            </div>
        </div>
    );
}

export default ReceptionDashboard;
