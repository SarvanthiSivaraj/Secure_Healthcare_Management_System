import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import { visitApi } from '../../api/visitApi';
import { workflowApi } from '../../api/workflowApi';
import { emrApi } from '../../api/emrApi';
import '../patient/Dashboard.css';

function NurseDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [assignedVisits, setAssignedVisits] = useState([]);
    const [visitStaff, setVisitStaff] = useState([]);
    const [visitPrescriptions, setVisitPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedVisitId, setSelectedVisitId] = useState('');
    const [vitalsForm, setVitalsForm] = useState({ bp: '', pulse: '', temperature: '', spo2: '' });
    const [careNoteForm, setCareNoteForm] = useState({ category: 'observation', note: '' });

    const displayName = `${user?.firstName || 'Nurse'} ${user?.lastName || ''}`.trim();
    const shiftStatus = user?.shiftStatus || 'ON_DUTY';

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const visitsResponse = await visitApi.getActiveVisits();
                const visits = visitsResponse?.data || [];
                setAssignedVisits(visits);
                setSelectedVisitId((previous) => previous || visits[0]?.id || '');

                if (visits.length > 0) {
                    const firstVisitId = visits[0].id;
                    const [staffResponse, prescriptionsResponse] = await Promise.all([
                        visitApi.getVisitStaff(firstVisitId),
                        emrApi.getVisitPrescriptions(firstVisitId),
                    ]);

                    setVisitStaff(staffResponse?.data || []);
                    setVisitPrescriptions(prescriptionsResponse?.data || []);
                } else {
                    setVisitStaff([]);
                    setVisitPrescriptions([]);
                }

                const notificationsResponse = await workflowApi.getUserNotifications(true);
                setNotifications(notificationsResponse?.data || []);
            } catch (requestError) {
                setError(requestError?.response?.data?.message || 'Failed to load nurse dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const selectedVisit = useMemo(
        () => assignedVisits.find((visit) => visit.id === selectedVisitId) || assignedVisits[0],
        [assignedVisits, selectedVisitId]
    );

    const submitVitals = async (event) => {
        event.preventDefault();
        if (!selectedVisit?.id || !selectedVisit?.patient_id) {
            setError('Select an assigned visit before recording vitals.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await emrApi.createMedicalRecord({
                patientId: selectedVisit.patient_id,
                visitId: selectedVisit.id,
                type: 'consultation',
                title: 'Nursing Vitals Entry',
                description: `BP: ${vitalsForm.bp}; Pulse: ${vitalsForm.pulse}; Temp: ${vitalsForm.temperature}; SpO2: ${vitalsForm.spo2}`,
            });

            setSuccess('Vitals recorded successfully.');
            setVitalsForm({ bp: '', pulse: '', temperature: '', spo2: '' });
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to record vitals');
        } finally {
            setSaving(false);
        }
    };

    const submitCareNote = async (event) => {
        event.preventDefault();
        if (!selectedVisit?.id || !selectedVisit?.patient_id) {
            setError('Select an assigned visit before saving a care note.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await emrApi.createMedicalRecord({
                patientId: selectedVisit.patient_id,
                visitId: selectedVisit.id,
                type: 'consultation',
                title: `Nursing Note (${careNoteForm.category})`,
                description: careNoteForm.note,
            });

            setSuccess('Care note submitted and locked as read-only.');
            setCareNoteForm({ category: 'observation', note: '' });
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to submit care note');
        } finally {
            setSaving(false);
        }
    };

    const stats = useMemo(() => {
        const pendingMedication = visitPrescriptions.filter((prescription) => prescription.status === 'pending').length;
        return {
            assignedPatients: assignedVisits.length,
            careTeamSize: visitStaff.length,
            pendingMedication,
            notifications: notifications.length,
        };
    }, [assignedVisits, visitStaff, visitPrescriptions, notifications]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Nurse Portal</h1>
                        <p className="header-subtitle">Assigned patient care and medication administration workflow</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
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

                {error && <div className="dashboard-panel">{error}</div>}
                {success && <div className="dashboard-panel">{success}</div>}

                <section className="dashboard-section">
                    <h2 className="section-title">Write Actions</h2>
                    <div className="dashboard-panel">
                        <label className="readonly-note">Target Visit</label>
                        <select
                            value={selectedVisitId}
                            onChange={(event) => setSelectedVisitId(event.target.value)}
                            style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                        >
                            {assignedVisits.map((visit) => (
                                <option key={visit.id} value={visit.id}>
                                    {visit.id?.slice(0, 8)} - {(visit.patient_first_name || '')} {(visit.patient_last_name || '')}
                                </option>
                            ))}
                        </select>

                        <div className="dashboard-section-grid">
                            <form className="dashboard-panel" onSubmit={submitVitals}>
                                <h3 className="panel-title">Record Vitals</h3>
                                <input placeholder="BP (e.g. 120/80)" value={vitalsForm.bp} onChange={(event) => setVitalsForm((p) => ({ ...p, bp: event.target.value }))} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }} required />
                                <input placeholder="Pulse" value={vitalsForm.pulse} onChange={(event) => setVitalsForm((p) => ({ ...p, pulse: event.target.value }))} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }} required />
                                <input placeholder="Temperature" value={vitalsForm.temperature} onChange={(event) => setVitalsForm((p) => ({ ...p, temperature: event.target.value }))} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }} required />
                                <input placeholder="SpO2" value={vitalsForm.spo2} onChange={(event) => setVitalsForm((p) => ({ ...p, spo2: event.target.value }))} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }} required />
                                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit Vitals'}</Button>
                            </form>

                            <form className="dashboard-panel" onSubmit={submitCareNote}>
                                <h3 className="panel-title">Submit Care Note</h3>
                                <select value={careNoteForm.category} onChange={(event) => setCareNoteForm((p) => ({ ...p, category: event.target.value }))} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}>
                                    <option value="observation">Observation</option>
                                    <option value="wound_care">Wound Care</option>
                                    <option value="medication">Medication Administration</option>
                                </select>
                                <textarea placeholder="Enter nursing note" value={careNoteForm.note} onChange={(event) => setCareNoteForm((p) => ({ ...p, note: event.target.value }))} rows={5} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }} required />
                                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit Note'}</Button>
                                <p className="readonly-note">After submission, records are immutable by backend policy.</p>
                            </form>
                        </div>
                    </div>
                </section>

                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.assignedPatients}</div>
                        <div className="stat-label">Assigned Visits</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.careTeamSize}</div>
                        <div className="stat-label">Care Team Members</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.pendingMedication}</div>
                        <div className="stat-label">Pending Medication</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.notifications}</div>
                        <div className="stat-label">Unread Alerts</div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Patient Care Queue (Live)</h2>
                    <div className="dashboard-panel">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Visit</th>
                                    <th>Patient</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Scheduled</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedVisits.length === 0 ? (
                                    <tr><td colSpan="5">No assigned visits found.</td></tr>
                                ) : (
                                    assignedVisits.slice(0, 8).map((visit) => (
                                        <tr key={visit.id}>
                                            <td>{visit.id?.slice(0, 8) || '-'}</td>
                                            <td>{`${visit.patient_first_name || ''} ${visit.patient_last_name || ''}`.trim() || visit.patient_id || '-'}</td>
                                            <td>{visit.status || '-'}</td>
                                            <td>{visit.priority || 'normal'}</td>
                                            <td>{visit.scheduled_time ? new Date(visit.scheduled_time).toLocaleString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Medication Administration (Live)</h2>
                    <div className="dashboard-panel">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Medication</th>
                                    <th>Dosage</th>
                                    <th>Frequency</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitPrescriptions.length === 0 ? (
                                    <tr><td colSpan="4">No prescriptions found for current assigned visit.</td></tr>
                                ) : (
                                    visitPrescriptions.slice(0, 8).map((prescription) => (
                                        <tr key={prescription.id}>
                                            <td>{prescription.medication}</td>
                                            <td>{prescription.dosage || '-'}</td>
                                            <td>{prescription.frequency || '-'}</td>
                                            <td>{prescription.status || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <p className="readonly-note">Prescriptions are read-only for nursing role.</p>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Alerts & Notifications (Live)</h2>
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
                        <div className="nav-card" onClick={() => navigate('/staff/visit-queue')}>
                            <div className="nav-card-header"><h3>Visit Queue</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Open detailed visit queue with role actions</p>
                        </div>
                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header"><h3>Workflow Board</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Track lifecycle, tasks, and care workflow state</p>
                        </div>
                    </div>
                </div>

                <GovernancePanel roleLabel="nurse" scopeLabel="Treatment → Nursing & Labs only" />
            </div>
        </div>
    );
}

export default NurseDashboard;
