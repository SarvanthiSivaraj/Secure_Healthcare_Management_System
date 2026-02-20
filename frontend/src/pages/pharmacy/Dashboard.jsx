import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import '../patient/Dashboard.css';

function PharmacyDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const displayName = `${user?.firstName || 'Pharmacist'} ${user?.lastName || ''}`.trim();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Pharmacy Portal</h1>
                        <p className="header-subtitle">Prescription fulfillment and medication safety checks</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || 'PHARM-2024-001'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Dispensing Ready</span>
                    </div>
                </div>

                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">18</div>
                        <div className="stat-label">Pending Orders</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">7</div>
                        <div className="stat-label">Verification Queue</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">26</div>
                        <div className="stat-label">Dispensed Today</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">3</div>
                        <div className="stat-label">Interaction Alerts</div>
                    </div>
                </div>

                <div className="nav-section">
                    <h2 className="section-title">Pharmacy Actions</h2>

                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header">
                                <h3>Medication Queue</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Review active prescriptions tied to live patient visits
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header">
                                <h3>Order Workflow</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Track medication preparation and handoff status
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/doctor/active-visits')}>
                            <div className="nav-card-header">
                                <h3>Priority Medication Cases</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Monitor urgent treatment plans requiring immediate dispensing
                            </p>
                        </div>

                        <div className="nav-card" onClick={() => navigate('/staff/dashboard')}>
                            <div className="nav-card-header">
                                <h3>Staff Operations</h3>
                                <span className="nav-arrow">→</span>
                            </div>
                            <p className="nav-card-description">
                                Return to shared operational tools and support functions
                            </p>
                        </div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Prescription & Dispensing</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Prescription Queue</h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Visit ID</th>
                                        <th>Prescription</th>
                                        <th>Approval</th>
                                        <th>Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>V-3421</td>
                                        <td>Amoxicillin 500mg</td>
                                        <td>Doctor-approved</td>
                                        <td>Read-only</td>
                                    </tr>
                                    <tr>
                                        <td>V-3422</td>
                                        <td>Aspirin 75mg</td>
                                        <td>Doctor-approved</td>
                                        <td>Read-only</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Medication Dispensing Panel</h3>
                            <ul className="data-list">
                                <li>Verify prescription validity</li>
                                <li>Check drug interaction warnings</li>
                                <li>Perform inventory availability check</li>
                                <li>Dispense or partial dispense</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Inventory, Logging & History</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Inventory Integration</h3>
                            <ul className="data-list">
                                <li>Stock levels: synced</li>
                                <li>Expiry alerts: 7 medications near expiry</li>
                                <li>Reorder signals generated for low-stock items</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Dispense Logging</h3>
                            <ul className="data-list">
                                <li>Quantity dispensed captured</li>
                                <li>Pharmacist ID captured</li>
                                <li>Timestamp captured for every dispense action</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Prescription History</h3>
                            <ul className="data-list">
                                <li>Patient medication timeline available</li>
                                <li>Adherence tracking and refill trend summary</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Drug Safety Alerts</h3>
                            <ul className="data-list">
                                <li>Allergy warning checks</li>
                                <li>Contraindication detection alerts</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Communication & Access Restrictions</h2>
                    <div className="dashboard-section-grid">
                        <div className="dashboard-panel">
                            <h3 className="panel-title">Communication</h3>
                            <ul className="data-list">
                                <li>Clarification request to doctor</li>
                                <li>Substitution approval workflow</li>
                            </ul>
                        </div>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Access Restrictions</h3>
                            <ul className="data-list">
                                <li>Cannot view consultation notes, imaging, full EMR, or insurance</li>
                                <li>Can view prescription, allergies, and minimal diagnosis context for safety</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <GovernancePanel roleLabel="pharmacist" scopeLabel="Treatment → Prescriptions, Allergies, Safety context" />
            </div>
        </div>
    );
}

export default PharmacyDashboard;
