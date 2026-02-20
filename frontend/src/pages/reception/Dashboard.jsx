import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import { visitApi } from '../../api/visitApi';
import { workflowApi } from '../../api/workflowApi';
import '../patient/Dashboard.css';

function ReceptionDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [hospitalVisits, setHospitalVisits] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionForm, setActionForm] = useState({
        visitId: '',
        scheduledTime: '',
        state: 'approved',
        reason: '',
    });

    const displayName = `${user?.firstName || 'Reception'} ${user?.lastName || 'Staff'}`.trim();

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const [visitsResponse, notificationsResponse] = await Promise.all([
                visitApi.getHospitalVisits(),
                workflowApi.getUserNotifications(true),
            ]);

            const visits = visitsResponse?.data || [];
            setHospitalVisits(visits);
            setActionForm((previous) => ({
                ...previous,
                visitId: previous.visitId || visits[0]?.id || '',
            }));
            setNotifications(notificationsResponse?.data || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.message || 'Failed to load reception dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const scheduleOrReschedule = async (event) => {
        event.preventDefault();
        if (!actionForm.visitId) {
            setError('Select a visit first.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            if (actionForm.scheduledTime) {
                await visitApi.updateVisit(actionForm.visitId, { scheduledTime: actionForm.scheduledTime });
            }
            await workflowApi.transitionVisitState(actionForm.visitId, actionForm.state, actionForm.reason || 'Reception update');
            setSuccess('Visit updated successfully.');
            setActionForm((previous) => ({ ...previous, reason: '' }));
            await loadDashboardData();
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to update visit');
        } finally {
            setSaving(false);
        }
    };

    const quickCheckIn = async () => {
        if (!actionForm.visitId) {
            setError('Select a visit first.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await workflowApi.transitionVisitState(actionForm.visitId, 'in_progress', 'Checked in at reception');
            setSuccess('Patient checked in.');
            await loadDashboardData();
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to check in patient');
        } finally {
            setSaving(false);
        }
    };

    const stats = useMemo(() => {
        const checkInsToday = hospitalVisits.filter((visit) => {
            if (!visit.checked_in_at) return false;
            const checkedInDate = new Date(visit.checked_in_at);
            const now = new Date();
            return checkedInDate.toDateString() === now.toDateString();
        }).length;

        const waitingPatients = hospitalVisits.filter((visit) => ['pending', 'approved'].includes((visit.status || '').toLowerCase())).length;
        const inConsultation = hospitalVisits.filter((visit) => (visit.status || '').toLowerCase() === 'in_progress').length;

        return {
            checkInsToday,
            waitingPatients,
            inConsultation,
            alerts: notifications.length,
        };
    }, [hospitalVisits, notifications]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Reception Portal</h1>
                        <p className="header-subtitle">Live check-in queue, visit lifecycle, and front-desk operations</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || user?.id || 'RECP-001'}</div>
                    </div>
                    <div className="account-status">
                        <span className="status-indicator"></span>
                        <span className="status-text">Desk Open</span>
                    </div>
                </div>

                {error && <div className="dashboard-panel">{error}</div>}
                {success && <div className="dashboard-panel">{success}</div>}

                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.checkInsToday}</div>
                        <div className="stat-label">Check-ins Today</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.waitingPatients}</div>
                        <div className="stat-label">Waiting Patients</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.inConsultation}</div>
                        <div className="stat-label">In Consultation</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.alerts}</div>
                        <div className="stat-label">Active Alerts</div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Patient Check-in Queue (Live)</h2>
                    <div className="dashboard-panel">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Visit</th>
                                    <th>Patient</th>
                                    <th>Status</th>
                                    <th>Doctor</th>
                                    <th>Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospitalVisits.length === 0 ? (
                                    <tr><td colSpan="5">No visits found for your organization.</td></tr>
                                ) : (
                                    hospitalVisits.slice(0, 12).map((visit) => (
                                        <tr key={visit.id}>
                                            <td>{visit.id?.slice(0, 8) || '-'}</td>
                                            <td>{`${visit.patient_first_name || ''} ${visit.patient_last_name || ''}`.trim() || visit.patient_id || '-'}</td>
                                            <td>{visit.status || '-'}</td>
                                            <td>{visit.doctor_first_name ? `${visit.doctor_first_name} ${visit.doctor_last_name || ''}`.trim() : 'Unassigned'}</td>
                                            <td>{visit.priority || 'normal'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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

                <section className="dashboard-section">
                    <h2 className="section-title">Write Actions</h2>
                    <div className="dashboard-panel">
                        <form onSubmit={scheduleOrReschedule}>
                            <select
                                value={actionForm.visitId}
                                onChange={(event) => setActionForm((previous) => ({ ...previous, visitId: event.target.value }))}
                                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                            >
                                {hospitalVisits.map((visit) => (
                                    <option key={visit.id} value={visit.id}>
                                        {visit.id?.slice(0, 8)} - {`${visit.patient_first_name || ''} ${visit.patient_last_name || ''}`.trim() || visit.patient_id || '-'}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="datetime-local"
                                value={actionForm.scheduledTime}
                                onChange={(event) => setActionForm((previous) => ({ ...previous, scheduledTime: event.target.value }))}
                                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                            />
                            <select
                                value={actionForm.state}
                                onChange={(event) => setActionForm((previous) => ({ ...previous, state: event.target.value }))}
                                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                            >
                                <option value="approved">Approved</option>
                                <option value="in_progress">In Progress</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <textarea
                                placeholder="Reason / note"
                                rows={3}
                                value={actionForm.reason}
                                onChange={(event) => setActionForm((previous) => ({ ...previous, reason: event.target.value }))}
                                style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                            />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Visit Update'}</Button>
                                <Button type="button" variant="secondary" disabled={saving} onClick={quickCheckIn}>Quick Check-in</Button>
                            </div>
                        </form>
                    </div>
                </section>

                <div className="nav-section">
                    <h2 className="section-title">Actions</h2>
                    <div className="nav-grid">
                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header"><h3>Visit Queue</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Open full queue with assignment and status updates</p>
                        </div>
                        <div className="nav-card" onClick={() => navigate('/staff/dashboard')}>
                            <div className="nav-card-header"><h3>Staff Operations</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Continue with registration and operational workflows</p>
                        </div>
                    </div>
                </div>

                <GovernancePanel roleLabel="receptionist" scopeLabel="Operations → Registration & Scheduling only" />
            </div>
        </div>
    );
}

export default ReceptionDashboard;
