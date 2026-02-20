import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PasskeySetupCard from '../../components/common/PasskeySetupCard';
import GovernancePanel from '../../components/dashboard/GovernancePanel';
import { visitApi } from '../../api/visitApi';
import { workflowApi } from '../../api/workflowApi';
import '../patient/Dashboard.css';

function LabDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [labOrders, setLabOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadForm, setUploadForm] = useState({ orderId: '', resultSummary: '', notes: '' });

    const displayName = `${user?.firstName || 'Lab'} ${user?.lastName || 'Technician'}`.trim();

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const visitResponse = await visitApi.getHospitalVisits();
            const visits = visitResponse?.data || [];

            const visitSubset = visits.slice(0, 8);
            const ordersPerVisit = await Promise.all(
                visitSubset.map(async (visit) => {
                    try {
                        const orderResponse = await workflowApi.getVisitLabOrders(visit.id);
                        const orders = orderResponse?.data || [];
                        return orders.map((order) => ({
                            ...order,
                            visitId: visit.id,
                            patientId: visit.patient_id || '-',
                            patientName: `${visit.patient_first_name || ''} ${visit.patient_last_name || ''}`.trim(),
                        }));
                    } catch (visitOrderError) {
                        return [];
                    }
                })
            );

            const flattenedOrders = ordersPerVisit.flat();
            setLabOrders(flattenedOrders);
            setUploadForm((previous) => ({
                ...previous,
                orderId: previous.orderId || flattenedOrders[0]?.id || '',
            }));

            const notificationsResponse = await workflowApi.getUserNotifications(true);
            setNotifications(notificationsResponse?.data || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.message || 'Failed to load lab dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const completeOrder = async (event) => {
        event.preventDefault();
        if (!uploadForm.orderId) {
            setError('Select a lab order first.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await workflowApi.updateLabOrderStatus(uploadForm.orderId, 'completed', {
                resultSummary: uploadForm.resultSummary,
                notes: uploadForm.notes,
                verifiedBy: user?.id,
            });

            setSuccess('Lab result uploaded and marked completed.');
            setUploadForm((previous) => ({ ...previous, resultSummary: '', notes: '' }));
            await loadDashboardData();
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to upload lab result');
        } finally {
            setSaving(false);
        }
    };

    const verifyOrder = async (orderId) => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await workflowApi.updateLabOrderStatus(orderId, 'verified', { verifiedBy: user?.id });
            setSuccess('Lab result verified.');
            await loadDashboardData();
        } catch (verifyError) {
            setError(verifyError?.response?.data?.message || 'Failed to verify result');
        } finally {
            setSaving(false);
        }
    };

    const stats = useMemo(() => {
        const pending = labOrders.filter((order) => ['pending', 'collected', 'received'].includes(order.status)).length;
        const inProgress = labOrders.filter((order) => ['processing', 'in_transit'].includes(order.status)).length;
        const completed = labOrders.filter((order) => order.status === 'completed').length;
        return {
            pending,
            inProgress,
            completed,
            total: labOrders.length,
        };
    }, [labOrders]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Lab Technician Portal</h1>
                        <p className="header-subtitle">Test queue, processing workflow, and result readiness</p>
                    </div>
                    <Button onClick={logout} variant="secondary">Sign Out</Button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="user-info-bar">
                    <div className="user-details">
                        <div className="user-name">{displayName}</div>
                        <div className="user-id">ID: {user?.staffId || user?.id || 'LAB-001'}</div>
                        <PasskeySetupCard />
                    </div>
                    <div className="account-status">
                        <span className="status-indicator active"></span>
                        <span className="status-text">Available</span>
                    </div>
                </div>

                {error && <div className="dashboard-panel">{error}</div>}
                {success && <div className="dashboard-panel">{success}</div>}

                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.pending}</div>
                        <div className="stat-label">Pending Tests</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{loading ? '...' : stats.total}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                </div>

                <section className="dashboard-section">
                    <h2 className="section-title">Test Request Queue (Live)</h2>
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
                                {labOrders.length === 0 ? (
                                    <tr><td colSpan="5">No lab orders found.</td></tr>
                                ) : (
                                    labOrders.slice(0, 12).map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.priority || 'routine'}</td>
                                            <td>{order.patientId}</td>
                                            <td>{order.visitId?.slice(0, 8) || '-'}</td>
                                            <td>{order.test_name || order.testName || '-'}</td>
                                            <td>{order.status || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Sample Tracking</h2>
                    <div className="dashboard-panel">
                        <div className="pill-row">
                            <span className="status-pill">Collected</span>
                            <span className="status-pill">In transit</span>
                            <span className="status-pill">Received</span>
                            <span className="status-pill">Processing</span>
                            <span className="status-pill">Completed</span>
                        </div>
                        <p className="readonly-note">Barcode scan integration remains pending backend device API.</p>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">Write Actions</h2>
                    <div className="dashboard-section-grid">
                        <form className="dashboard-panel" onSubmit={completeOrder}>
                            <h3 className="panel-title">Upload Results</h3>
                            <select
                                value={uploadForm.orderId}
                                onChange={(event) => setUploadForm((previous) => ({ ...previous, orderId: event.target.value }))}
                                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                            >
                                {labOrders.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        {order.id?.slice(0, 8)} - {order.test_name || order.testName || 'Lab Test'}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Result summary"
                                value={uploadForm.resultSummary}
                                onChange={(event) => setUploadForm((previous) => ({ ...previous, resultSummary: event.target.value }))}
                                rows={4}
                                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                                required
                            />
                            <textarea
                                placeholder="Technician notes"
                                value={uploadForm.notes}
                                onChange={(event) => setUploadForm((previous) => ({ ...previous, notes: event.target.value }))}
                                rows={3}
                                style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 8, border: '1px solid #BFDBFE' }}
                            />
                            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Upload & Complete'}</Button>
                        </form>

                        <div className="dashboard-panel">
                            <h3 className="panel-title">Verification Queue</h3>
                            <ul className="data-list">
                                {labOrders.slice(0, 6).map((order) => (
                                    <li key={order.id}>
                                        {order.test_name || order.testName || 'Lab Test'} - {order.status}
                                        <div style={{ marginTop: 8 }}>
                                            <Button
                                                disabled={saving || order.status === 'verified'}
                                                onClick={() => verifyOrder(order.id)}
                                            >
                                                {order.status === 'verified' ? 'Verified' : 'Verify'}
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                            <p className="nav-card-description">Open visit queue for full context and routing</p>
                        </div>
                        <div className="nav-card" onClick={() => navigate('/staff/workflow')}>
                            <div className="nav-card-header"><h3>Workflow Board</h3><span className="nav-arrow">→</span></div>
                            <p className="nav-card-description">Track order lifecycle transitions and handoffs</p>
                        </div>
                    </div>
                </div>

                <GovernancePanel roleLabel="lab technician" scopeLabel="Treatment → Labs only" />
            </div>
        </div>
    );
}

export default LabDashboard;
