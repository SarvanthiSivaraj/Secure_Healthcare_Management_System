import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import { visitApi } from '../../api/visitApi';
import { workflowApi } from '../../api/workflowApi';
import { emrApi } from '../../api/emrApi';
import '../patient/Dashboard.css';

function PharmacyDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');

    const displayName = `${user?.firstName || 'Pharmacist'} ${user?.lastName || ''}`.trim();

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const visitResponse = await visitApi.getHospitalVisits();
            const visits = visitResponse?.data || [];

            const prescriptionsPerVisit = await Promise.all(
                visits.slice(0, 10).map(async (visit) => {
                    try {
                        const prescriptionsResponse = await emrApi.getVisitPrescriptions(visit.id);
                        const rows = prescriptionsResponse?.data || [];
                        return rows.map((prescription) => ({
                            ...prescription,
                            visitId: visit.id,
                            patientName: `${visit.patient_first_name || ''} ${visit.patient_last_name || ''}`.trim() || visit.patient_id || '-',
                        }));
                    } catch (visitPrescriptionError) {
                        return [];
                    }
                })
            );

            setPrescriptions(prescriptionsPerVisit.flat());

            const notificationsResponse = await workflowApi.getUserNotifications(true);
            setNotifications(notificationsResponse?.data || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.message || 'Failed to load pharmacy dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleMarkActive = async (prescriptionId) => {
        setActionLoadingId(prescriptionId);
        try {
            await emrApi.updatePrescriptionStatus(prescriptionId, 'active');
            await loadDashboardData();
        } catch (updateError) {
            setError(updateError?.response?.data?.message || 'Failed to update prescription status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const stats = useMemo(() => {
        const pending = prescriptions.filter((prescription) => prescription.status === 'pending').length;
        const active = prescriptions.filter((prescription) => prescription.status === 'active').length;
        const completed = prescriptions.filter((prescription) => prescription.status === 'completed').length;
        return {
            pending,
            active,
            completed,
            alerts: notifications.length,
        };
    }, [prescriptions, notifications]);

    return (
        <div className="pharmacy-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Pharmacy Portal</h1>
                        <p className="header-subtitle">Prescription queue and dispensing workflow</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || user?.id || 'PHARM-001'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Dispensing Ready</span>
                    </div>
                </div>

                {error && <div className="dashboard-panel">{error}</div>}

                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.pending}</div>
                        <div className="stat-label">Pending Rx</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.active}</div>
                        <div className="stat-label">Active Rx</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.completed}</div>
                        <div className="stat-label">Completed Rx</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.alerts}</div>
                        <div className="stat-label">Unread Alerts</div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Prescription Queue (Live)</h2>
                    <div className="dashboard-panel">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Visit</th>
                                    <th>Patient</th>
                                    <th>Medication</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.length === 0 ? (
                                    <tr><td colSpan="5">No prescriptions available.</td></tr>
                                ) : (
                                    prescriptions.slice(0, 12).map((prescription) => (
                                        <tr key={prescription.id}>
                                            <td>{prescription.visitId?.slice(0, 8) || '-'}</td>
                                            <td>{prescription.patientName}</td>
                                            <td>{prescription.medication || '-'}</td>
                                            <td>{prescription.status || '-'}</td>
                                            <td>
                                                {prescription.status === 'pending' ? (
                                                    <Button
                                                        onClick={() => handleMarkActive(prescription.id)}
                                                        disabled={actionLoadingId === prescription.id}
                                                    >
                                                        {actionLoadingId === prescription.id ? 'Updating...' : 'Mark Active'}
                                                    </Button>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <p className="readonly-note">Read-only prescription details with allowed status transitions only.</p>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Alerts (Live)</h2>
                    <div className="dashboard-panel">
                        <ul className="data-list">
                            {notifications.length === 0 ? (
                                <li>No unread notifications.</li>
                            ) : (
                                notifications.slice(0, 6).map((notification) => (
                                    <li key={notification.id}>{notification.title || notification.type}: {notification.message}</li>
                                ))
                            )}
                        </ul>
                    </div>
                </section>

                <div className="nav-section">
                    <h2 className="section-title">Actions</h2>
                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header"><h3>Workflow Board</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Open medication and clinical workflow activity</p>
                        </div>
                        <div className="nav-card" onClick={() => navigate('/staff/dashboard')}>
                            <div className="nav-card-header"><h3>Staff Operations</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Return to shared operational dashboards</p>
                        </div>
                    </div>
                </div>

                <GovernancePanel roleLabel="pharmacist" scopeLabel="Treatment → Prescriptions, Allergies, Safety context" />
            </div>
        </div>
    );
}

export default PharmacyDashboard;
