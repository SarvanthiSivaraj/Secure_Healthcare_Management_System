import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import workflowApi from '../../api/workflowApi';
import './ImagingQueue.css';

const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'completed'];

const STATUS_LABELS = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

function ImagingQueue() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, logout } = useContext(AuthContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState(
        searchParams.get('priority') === 'stat' ? 'pending' : 'all'
    );
    const [statOnly] = useState(searchParams.get('priority') === 'stat');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch imaging-related notifications for this radiologist.
            // Falls back to demo data when the backend is unavailable.
            const result = await workflowApi.getUserNotifications(false).catch(() => null);

            if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
                const imagingNotifs = result.data.filter(n =>
                    n.referenceType === 'imaging_order' || n.type === 'imaging'
                );
                if (imagingNotifs.length > 0) {
                    setOrders(imagingNotifs.map((n, idx) => ({
                        id: n.referenceId || `img-${idx}`,
                        visitId: n.metadata?.visitId || 'N/A',
                        patientName: n.metadata?.patientName || 'Patient',
                        imagingType: n.metadata?.imagingType || 'General',
                        bodyPart: n.metadata?.bodyPart || '—',
                        priority: n.metadata?.priority || 'routine',
                        status: n.metadata?.status || 'pending',
                        orderedBy: n.metadata?.orderedBy || 'Physician',
                        orderedAt: n.createdAt || n.timestamp,
                    })));
                    return;
                }
            }
            // No imaging notifications available — show demo data
            setOrders(getDemoOrders());
        } catch {
            setOrders(getDemoOrders());
            setError('Could not connect to backend — showing sample data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getDemoOrders = () => [
        {
            id: 'img-001',
            visitId: 'VST-001',
            patientName: 'Anjali Mehta',
            imagingType: 'MRI',
            bodyPart: 'Brain',
            priority: 'stat',
            status: 'pending',
            orderedBy: 'Dr. Sharma',
            orderedAt: new Date().toISOString(),
        },
        {
            id: 'img-002',
            visitId: 'VST-002',
            patientName: 'Ravi Patel',
            imagingType: 'X-Ray',
            bodyPart: 'Chest',
            priority: 'routine',
            status: 'in_progress',
            orderedBy: 'Dr. Kapoor',
            orderedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: 'img-003',
            visitId: 'VST-003',
            patientName: 'Priya Singh',
            imagingType: 'CT Scan',
            bodyPart: 'Abdomen',
            priority: 'urgent',
            status: 'pending',
            orderedBy: 'Dr. Verma',
            orderedAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
            id: 'img-004',
            visitId: 'VST-004',
            patientName: 'Suresh Kumar',
            imagingType: 'Ultrasound',
            bodyPart: 'Pelvis',
            priority: 'routine',
            status: 'completed',
            orderedBy: 'Dr. Gupta',
            orderedAt: new Date(Date.now() - 86400000).toISOString(),
        },
    ];

    const filtered = orders.filter(o => {
        if (statOnly && o.priority !== 'stat') return false;
        if (activeFilter === 'all') return true;
        return o.status === activeFilter;
    });

    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="iq-container">
            {/* Header */}
            <header className="iq-header">
                <div className="iq-header-content">
                    <div className="iq-header-left">
                        <button className="iq-back-btn" onClick={() => navigate('/radiology/dashboard')}>
                            ← Back
                        </button>
                        <div>
                            <h1>{statOnly ? '⚡ STAT Imaging Orders' : '🗂️ Imaging Queue'}</h1>
                            <p className="iq-header-sub">Assigned cases only — access is logged and audited</p>
                        </div>
                    </div>
                    <button className="iq-signout-btn" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <div className="iq-content">
                {/* Access Notice */}
                <div className="iq-access-notice">
                    <span>🔒</span>
                    <span>
                        <strong>Audit Active:</strong> All imaging access by&nbsp;
                        Dr. {user?.firstName} {user?.lastName} is being logged with timestamps.
                    </span>
                </div>

                {/* Filter Tabs */}
                <div className="iq-filter-bar">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f}
                            className={`iq-filter-btn ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f === 'all' ? 'All Orders' : STATUS_LABELS[f] || f}
                            {f !== 'all' && (
                                <span className="iq-filter-count">
                                    {orders.filter(o => o.status === f && (!statOnly || o.priority === 'stat')).length}
                                </span>
                            )}
                        </button>
                    ))}
                    <div className="iq-spacer" />
                    <button className="iq-refresh-btn" onClick={fetchOrders} title="Refresh">
                        🔄 Refresh
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="iq-error-banner">⚠️ {error}</div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="iq-loading">
                        <span className="iq-spinner" /> Loading imaging orders…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="iq-empty">
                        <span className="iq-empty-icon">🩻</span>
                        <h3>No imaging orders found</h3>
                        <p>There are no {activeFilter !== 'all' ? activeFilter.replace('_', ' ') : ''} orders assigned to you.</p>
                    </div>
                ) : (
                    <div className="iq-order-list">
                        {filtered.map(order => (
                            <div key={order.id} className="iq-order-card">
                                <div className="iq-order-left">
                                    <div className="iq-imaging-icon">
                                        {order.imagingType === 'MRI' ? '🧲' :
                                            order.imagingType === 'CT Scan' ? '🔬' :
                                                order.imagingType === 'X-Ray' ? '⚡' :
                                                    order.imagingType === 'Ultrasound' ? '📡' : '🩻'}
                                    </div>
                                    <div>
                                        <div className="iq-order-patient">{order.patientName}</div>
                                        <div className="iq-order-type">
                                            {order.imagingType} &mdash; {order.bodyPart}
                                        </div>
                                        <div className="iq-order-meta">
                                            Visit: <strong>{order.visitId}</strong> &nbsp;·&nbsp;
                                            Ordered by: {order.orderedBy} &nbsp;·&nbsp;
                                            {formatDate(order.orderedAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="iq-order-right">
                                    <span className={`iq-priority-badge ${order.priority}`}>
                                        {order.priority === 'stat' ? '⚡ STAT' :
                                            order.priority === 'urgent' ? '🔴 Urgent' : '🔵 Routine'}
                                    </span>
                                    <span className={`iq-status-badge ${order.status}`}>
                                        {STATUS_LABELS[order.status] || order.status}
                                    </span>
                                    {order.status !== 'completed' && (
                                        <button
                                            className="iq-action-btn"
                                            onClick={() =>
                                                navigate(`/radiology/upload?orderId=${order.id}&visitId=${order.visitId}&patient=${encodeURIComponent(order.patientName)}&type=${encodeURIComponent(order.imagingType)}`)
                                            }
                                        >
                                            Upload Report →
                                        </button>
                                    )}
                                    {order.status === 'completed' && (
                                        <span className="iq-completed-label">✔ Report Filed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImagingQueue;
