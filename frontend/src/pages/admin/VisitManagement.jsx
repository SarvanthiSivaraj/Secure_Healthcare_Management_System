import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';
import Button from '../../components/common/Button';
import './VisitManagement.css';

function VisitManagement() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'pending');
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [approvalData, setApprovalData] = useState({ doctorId: '', nurseId: '' });

    const loadVisits = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log('🔍 Loading visits for tab:', activeTab);
            const statusFilter = activeTab === 'pending' ? 'pending' :
                activeTab === 'active' ? null :
                    activeTab;

            console.log('📡 Calling API with status filter:', statusFilter);
            const response = await visitApi.getHospitalVisits(statusFilter);
            console.log('✅ API Response:', response);

            // API returns { success: true, data: [...] }
            let filteredVisits = response.data || [];
            console.log('📋 Filtered visits (before tab filter):', filteredVisits);

            if (activeTab === 'active') {
                filteredVisits = filteredVisits.filter(v =>
                    ['approved', 'checked_in', 'in_progress'].includes(v.status)
                );
            } else if (activeTab === 'completed') {
                filteredVisits = filteredVisits.filter(v =>
                    ['completed', 'cancelled'].includes(v.status)
                );
            }

            console.log('📋 Final visits:', filteredVisits);
            setVisits(filteredVisits);
        } catch (err) {
            console.error('❌ Error loading visits:', err);
            console.error('❌ Error response:', err.response);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to load visits';
            setError(errorMsg);
            console.error('❌ Error message:', errorMsg);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadVisits();
    }, [loadVisits]);

    const handleApproveClick = async (visit) => {
        setSelectedVisit(visit);
        setShowApprovalModal(true);

        // Fetch doctors and nurses from API
        try {
            console.log('🔍 Fetching doctors and nurses...');
            const [doctorsResponse, nursesResponse] = await Promise.all([
                visitApi.getStaffByRole('doctor'),
                visitApi.getStaffByRole('nurse')
            ]);

            console.log('✅ Doctors response:', doctorsResponse);
            console.log('✅ Nurses response:', nursesResponse);
            console.log('👨‍⚕️ Doctors data:', doctorsResponse.data);
            console.log('👩‍⚕️ Nurses data:', nursesResponse.data);

            setDoctors(doctorsResponse.data || []);
            setNurses(nursesResponse.data || []);

            console.log('📊 Doctors state set to:', doctorsResponse.data || []);
            console.log('📊 Nurses state set to:', nursesResponse.data || []);
        } catch (err) {
            console.error('❌ Failed to load staff:', err);
            console.error('❌ Error response:', err.response);
            setDoctors([]);
            setNurses([]);
        }
    };

    const handleApproveVisit = async () => {
        try {
            const response = await visitApi.approveVisit(
                selectedVisit.id,
                null, // backend picks up existing doctor
                approvalData.nurseId || null
            );
            // Close modal and show success with code
            setShowApprovalModal(false);
            const approvedCode = response.data?.otp_code || response.data?.otp;
            if (approvedCode) {
                alert(`Visit Approved! Visit Code: ${approvedCode}\n\nThis code has been sent to the patient's email.`);
            } else {
                alert('Visit Approved and assigned successfully!');
            }

            setApprovalData({ doctorId: '', nurseId: '' });
            setActiveTab('active'); // Switch to active tab
            loadVisits();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve visit');
        }
    };

    const handleCloseVisit = async (visitId, status) => {
        try {
            await visitApi.closeVisit(visitId, status);
            // Silently refresh the visits list
            loadVisits();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to close visit');
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'status-pending',
            approved: 'status-approved',
            checked_in: 'status-checked-in',
            in_progress: 'status-in-progress',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        return <span className={`status-badge ${statusColors[status]}`}>{status.replace('_', ' ')}</span>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="visit-management-container">
            <div className="visit-management-header">
                <div className="header-left">
                    <h1>Visit Management</h1>
                    <p className="subtitle">Manage patient visit requests and assignments</p>
                </div>
                <Button onClick={() => window.history.back()} variant="secondary" className="back-btn">
                    ← Back
                </Button>
            </div>

            <div className="visit-management-content">
                <div className="visit-tabs">
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-message">Loading visits...</div>}

                {!loading && (
                    <div className="visits-list">
                        {visits.length > 0 ? (
                            visits.map(visit => (
                                <div key={visit.id} className="visit-card">
                                    <div className="visit-card-header">
                                        <div className="visit-info">
                                            {getStatusBadge(visit.status)}
                                        </div>
                                        <span className="visit-time">{formatDate(visit.created_at)}</span>
                                    </div>

                                    <div className="visit-card-body">
                                        <div className="visit-detail">
                                            <strong>Patient:</strong> {visit.patient_first_name} {visit.patient_last_name}
                                        </div>
                                        <div className="visit-detail">
                                            <strong>Reason:</strong> {visit.reason}
                                        </div>
                                        {visit.symptoms && (
                                            <div className="visit-detail">
                                                <strong>Symptoms:</strong> {visit.symptoms}
                                            </div>
                                        )}
                                        {visit.doctor_first_name && (
                                            <div className="visit-detail">
                                                <strong>Doctor:</strong> Dr. {visit.doctor_first_name} {visit.doctor_last_name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="visit-card-actions">
                                        {visit.status === 'pending' && (
                                            <>
                                                <Button onClick={() => handleApproveClick(visit)} variant="primary">
                                                    Approve
                                                </Button>
                                                <Button onClick={() => handleCloseVisit(visit.id, 'cancelled')} variant="secondary">
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {['approved', 'checked_in', 'in_progress'].includes(visit.status) && (
                                            <>
                                                <Button onClick={() => handleCloseVisit(visit.id, 'completed')} variant="primary">
                                                    Complete Visit
                                                </Button>
                                                <Button onClick={() => handleCloseVisit(visit.id, 'cancelled')} variant="secondary">
                                                    Cancel Visit
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-requests-container">
                                <div className="no-requests-icon">📅</div>
                                <p>No {activeTab} requests</p>
                            </div>
                        )}
                    </div>
                )}

                {showApprovalModal && (
                    <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Approve Visit Request</h2>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Patient</label>
                                    <p>{selectedVisit?.patient_first_name} {selectedVisit?.patient_last_name}</p>
                                </div>

                                <div className="form-group">
                                    <label>Reason</label>
                                    <p>{selectedVisit?.reason}</p>
                                </div>

                                <div className="form-group">
                                    <label>Assigned Doctor</label>
                                    <p>Dr. {selectedVisit?.doctor_first_name} {selectedVisit?.doctor_last_name}</p>
                                </div>

                                <div className="form-group">
                                    <label>Assign Nurse (Optional)</label>
                                    <select
                                        value={approvalData.nurseId}
                                        onChange={(e) => setApprovalData({ ...approvalData, nurseId: e.target.value })}
                                    >
                                        <option value="">Select a nurse</option>
                                        {nurses.map(nurse => (
                                            <option key={nurse.id} value={nurse.id}>{nurse.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <p className="info-text">
                                    ℹ️ Patient will receive an email with the visit code after approval.
                                </p>
                            </div>

                            <div className="modal-actions">
                                <Button onClick={() => setShowApprovalModal(false)} variant="secondary">
                                    Cancel
                                </Button>
                                <Button onClick={handleApproveVisit} variant="primary">
                                    Approve & Notify Patient
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VisitManagement;
