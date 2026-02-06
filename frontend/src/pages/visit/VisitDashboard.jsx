import React, { useState, useEffect } from 'react';
import VisitLifecycle from '../../components/visit/VisitLifecycle';
import Button from '../../components/common/Button';
import './VisitDashboard.css';

function VisitDashboard({ visitId }) {
    const [visit, setVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const loadVisitDetails = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const data = await visitApi.getVisitDetails(visitId);

            // Mock data
            const mockVisit = {
                id: visitId || 'V-2024-001',
                patientName: 'John Doe',
                patientId: 'P12345',
                dateOfBirth: '1985-03-15',
                visitDate: '2024-02-05',
                visitTime: '10:00 AM',
                status: 'ACTIVE',
                reason: 'Routine Checkup',
                timestamps: {
                    SCHEDULED: '2024-02-05T10:00:00',
                    CHECKED_IN: '2024-02-05T09:55:00',
                    ACTIVE: '2024-02-05T10:05:00',
                },
                assignedStaff: [
                    { id: 1, name: 'Dr. Sarah Smith', role: 'DOCTOR', shift: '08:00 - 16:00' },
                    { id: 2, name: 'Emily Davis', role: 'NURSE', shift: '09:00 - 17:00' },
                ],
                requests: {
                    lab: [
                        { id: 1, test: 'Complete Blood Count', status: 'PENDING', priority: 'ROUTINE' },
                        { id: 2, test: 'Lipid Panel', status: 'COMPLETED', priority: 'ROUTINE' },
                    ],
                    imaging: [
                        { id: 1, type: 'X-Ray', area: 'Chest', status: 'PENDING', priority: 'URGENT' },
                    ],
                    prescriptions: [
                        { id: 1, medication: 'Amoxicillin', dosage: '500mg', status: 'ACTIVE' },
                    ],
                },
                notes: [
                    {
                        id: 1,
                        author: 'Dr. Sarah Smith',
                        timestamp: '2024-02-05T10:15:00',
                        content: 'Patient is stable. Vital signs within normal range.',
                    },
                ],
            };

            setVisit(mockVisit);
        } catch (error) {
            console.error('Failed to load visit details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVisitDetails();
    }, []);

    const handleCloseVisit = () => {
        console.log('Closing visit:', visitId);
        // TODO: Implement visit closure logic
    };

    if (loading) {
        return (
            <div className="visit-dashboard">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading visit details...</p>
                </div>
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="visit-dashboard">
                <div className="error-state">
                    <span className="error-icon">⚠️</span>
                    <h3>Visit Not Found</h3>
                    <p>The requested visit could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="visit-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h2>Visit Dashboard</h2>
                    <p className="header-subtitle">
                        Managing Visit: {visitId}
                    </p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary">Print Summary</Button>
                    {visit?.status === 'ACTIVE' && (
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
                            <span className="info-value">{visit?.patientName}</span>
                            <span className="info-subtext">ID: {visit?.patientId}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Status</span>
                            <span className="info-value status-badge">{visit?.status}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Reason</span>
                            <span className="info-value">{visit?.reason}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Date & Time</span>
                            <span className="info-value">{visit?.visitDate}</span>
                            <span className="info-subtext">{visit?.visitTime}</span>
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
                        className={`tab ${activeTab === 'lifecycle' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lifecycle')}
                    >
                        Timeline
                    </button>
                    <button
                        className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
                        onClick={() => setActiveTab('staff')}
                    >
                        Staff
                        <span className="tab-badge">{visit?.assignedStaff?.length || 0}</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests
                        <span className="tab-badge">
                            {(visit?.requests?.lab?.length || 0) + (visit?.requests?.imaging?.length || 0) + (visit?.requests?.prescriptions?.length || 0)}
                        </span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <div className="section-grid">
                                <div className="grid-section notes-section">
                                    <h4>Most Recent Notes</h4>
                                    <div className="notes-list">
                                        {visit?.notes?.map(note => (
                                            <div key={note.id} className="note-item">
                                                <div className="note-header">
                                                    <span className="note-type">{note.type}</span>
                                                    <span className="note-time">
                                                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="note-content">{note.content}</p>
                                                <span className="note-by">by {note.author}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid-section">
                                    <VisitLifecycle
                                        currentStatus={visit?.status}
                                        timestamps={visit?.timestamps}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'lifecycle' && (
                        <div className="lifecycle-tab">
                            <VisitLifecycle
                                currentStatus={visit?.status}
                                timestamps={visit?.timestamps}
                            />
                        </div>
                    )}

                    {/* Staff Tab */}
                    {activeTab === 'staff' && (
                        <div className="staff-tab">
                            <div className="staff-list">
                                {visit?.assignedStaff?.map(staff => (
                                    <div key={staff.id} className="staff-card">
                                        <div className="staff-avatar">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div className="staff-details">
                                            <h4>{staff.name}</h4>
                                            <p className="staff-role">{staff.role}</p>
                                            <p className="staff-shift">{staff.shift}</p>
                                        </div>
                                        <Button size="small" variant="secondary">Message</Button>
                                    </div>
                                ))}
                                <Button variant="outline" fullWidth>+ Assign Staff</Button>
                            </div>
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="requests-tab">
                            <div className="request-section">
                                <h4>Lab Requests</h4>
                                <div className="request-list">
                                    {visit?.requests?.lab?.map(req => (
                                        <div key={req.id} className="request-item">
                                            <span className="request-name">{req.test}</span>
                                            <span className={`request-status status-${req.status.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                    <Button size="small" variant="secondary">+ New Lab Request</Button>
                                </div>
                            </div>

                            <div className="request-section">
                                <h4>Imaging Requests</h4>
                                <div className="request-list">
                                    {visit?.requests?.imaging?.map(req => (
                                        <div key={req.id} className="request-item">
                                            <span className="request-name">{req.type} - {req.area}</span>
                                            <span className={`request-status status-${req.status.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                    <Button size="small" variant="secondary">+ New Imaging Request</Button>
                                </div>
                            </div>

                            <div className="request-section">
                                <h4>Prescriptions</h4>
                                <div className="request-list">
                                    {visit?.requests?.prescriptions?.map(req => (
                                        <div key={req.id} className="request-item">
                                            <span className="request-name">{req.medication} {req.dosage}</span>
                                            <span className="request-status status-prescribed">
                                                Active
                                            </span>
                                        </div>
                                    ))}
                                    <Button size="small" variant="secondary">+ Add Prescription</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VisitDashboard;
