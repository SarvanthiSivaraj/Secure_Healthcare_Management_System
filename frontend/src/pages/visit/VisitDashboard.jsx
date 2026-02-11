import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VisitLifecycle from '../../components/visit/VisitLifecycle';
import Button from '../../components/common/Button';
import LabRequestForm from '../../components/clinical/LabRequestForm';
import ImagingRequestForm from '../../components/clinical/ImagingRequestForm';
import PrescriptionForm from '../../components/clinical/PrescriptionForm';
import { visitApi } from '../../api/visitApi';
import { emrApi } from '../../api/emrApi';
import { useAuth } from '../../context/AuthContext';
import './VisitDashboard.css';

function VisitDashboard() {
    const { visitId } = useParams();
    const { user } = useAuth();
    const [visit, setVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Modal states
    const [showLabModal, setShowLabModal] = useState(false);
    const [showImagingModal, setShowImagingModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

    const loadVisitDetails = async () => {
        setLoading(true);
        try {
            // Fetch visit details
            // Note: Currently visitApi doesn't have a direct getVisitDetails by ID for all roles.
            // We might need to rely on getHospitalVisits or add a specific endpoint.
            // For now, let's assume we can fetch it or filter from list if API is limited.
            // Ideally: const data = await visitApi.getVisitDetails(visitId);

            // Temporary workaround if specific ID endpoint is missing:
            const visits = await visitApi.getHospitalVisits();
            const foundVisit = visits.data ? visits.data.find(v => v.id === visitId) : null;

            if (foundVisit) {
                // Fetch related medical records (Lab, Imaging, Prescriptions)
                const [labOrders, imagingOrders, prescriptions] = await Promise.all([
                    emrApi.getVisitLabOrders(visitId).catch(() => []),
                    emrApi.getVisitImagingOrders(visitId).catch(() => []),
                    emrApi.getVisitPrescriptions(visitId).catch(() => [])
                ]);

                // Construct the visit object with real data
                setVisit({
                    ...foundVisit,
                    patientName: `${foundVisit.patient_first_name} ${foundVisit.patient_last_name}`,
                    patientId: foundVisit.patient_id,
                    visitDate: new Date(foundVisit.created_at).toLocaleDateString(),
                    visitTime: new Date(foundVisit.created_at).toLocaleTimeString(),
                    labOrders: labOrders.data || [],
                    imagingOrders: imagingOrders.data || [],
                    prescriptions: prescriptions.data || []
                });
            } else {
                setError('Visit not found');
            }

        } catch (error) {
            console.error('Failed to load visit details:', error);
            setError('Failed to load visit details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visitId) {
            loadVisitDetails();
        }
    }, [visitId]);

    const handleCloseVisit = async () => {
        if (window.confirm('Are you sure you want to close this visit?')) {
            try {
                await visitApi.updateVisit(visitId, { status: 'closed' });
                loadVisitDetails(); // Refresh
            } catch (err) {
                alert('Failed to close visit');
            }
        }
    };

    const handleRequestSuccess = () => {
        setShowLabModal(false);
        setShowImagingModal(false);
        setShowPrescriptionModal(false);
        loadVisitDetails(); // Refresh data to show new request
        alert('Request submitted successfully');
    };

    if (loading) return <div className="loading">Loading visit details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!visit) return <div className="error">Visit not found</div>;

    return (
        <div className="visit-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h2>Visit Dashboard</h2>
                    <p className="header-subtitle">Managing Visit: {visitId}</p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary">Print Summary</Button>
                    {visit?.status === 'active' && (
                        <Button variant="danger" onClick={handleCloseVisit}>End Visit</Button>
                    )}
                </div>
            </div>

            <div className="dashboard-content">
                {/* Patient Info Card */}
                <div className="patient-info-card">
                    <div className="info-row">
                        <div className="info-group">
                            <span className="info-label">Patient</span>
                            <span className="info-value">{visit.patientName}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Status</span>
                            <span className="status-badge">{visit.status}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Reason</span>
                            <span className="info-value">{visit.reason}</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests
                    </button>
                    {/* Add other tabs as needed */}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <VisitLifecycle currentStatus={visit.status} timestamps={{}} />
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="requests-tab">
                            <div className="request-actions">
                                <Button onClick={() => setShowLabModal(true)}>+ Lab Request</Button>
                                <Button onClick={() => setShowImagingModal(true)}>+ Imaging Request</Button>
                                <Button onClick={() => setShowPrescriptionModal(true)}>+ Prescription</Button>
                            </div>

                            <div className="requests-lists">
                                {visit.labOrders && visit.labOrders.length > 0 && (
                                    <div className="request-section">
                                        <h4>Lab Orders</h4>
                                        <div className="orders-list">
                                            {visit.labOrders.map(order => (
                                                <div key={order.id} className="order-item">
                                                    <div className="order-details">
                                                        <span className="order-name">{order.test_name}</span>
                                                        <span className="order-info">{order.priority} • {new Date(order.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {visit.imagingOrders && visit.imagingOrders.length > 0 && (
                                    <div className="request-section">
                                        <h4>Imaging Orders</h4>
                                        <div className="orders-list">
                                            {visit.imagingOrders.map(order => (
                                                <div key={order.id} className="order-item">
                                                    <div className="order-details">
                                                        <span className="order-name">{order.imaging_type} - {order.body_part}</span>
                                                        <span className="order-info">{order.priority} • {new Date(order.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {visit.prescriptions && visit.prescriptions.length > 0 && (
                                    <div className="request-section">
                                        <h4>Prescriptions</h4>
                                        <div className="orders-list">
                                            {visit.prescriptions.map(rx => (
                                                <div key={rx.id} className="order-item">
                                                    <div className="order-details">
                                                        <span className="order-name">{rx.medication} {rx.dosage}</span>
                                                        <span className="order-info">{rx.frequency} • {rx.route}</span>
                                                    </div>
                                                    <span className={`status-badge status-${rx.status}`}>{rx.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(!visit.labOrders?.length && !visit.imagingOrders?.length && !visit.prescriptions?.length) && (
                                    <p className="no-data">No active requests or prescriptions.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showLabModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <LabRequestForm
                            visitId={visitId}
                            patientId={visit.patientId}
                            onClose={() => setShowLabModal(false)}
                            onSuccess={handleRequestSuccess}
                        />
                    </div>
                </div>
            )}

            {showImagingModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ImagingRequestForm
                            visitId={visitId}
                            patientId={visit.patientId}
                            onClose={() => setShowImagingModal(false)}
                            onSuccess={handleRequestSuccess}
                        />
                    </div>
                </div>
            )}

            {showPrescriptionModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <PrescriptionForm
                            onAdd={async (data) => {
                                try {
                                    await emrApi.createPrescription({ ...data, visitId, patientId: visit.patientId });
                                    handleRequestSuccess();
                                } catch (err) {
                                    alert('Failed to add prescription');
                                }
                            }}
                            onCancel={() => setShowPrescriptionModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default VisitDashboard;

