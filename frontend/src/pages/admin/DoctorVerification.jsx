import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import './DoctorVerification.css';

function DoctorVerification() {
    const navigate = useNavigate();
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pendingRes, statsRes] = await Promise.all([
                doctorApi.getPendingVerifications(),
                doctorApi.getVerificationStats()
            ]);

            if (pendingRes.success) {
                setPendingDoctors(pendingRes.data || []);
            }
            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Error fetching verification data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            const res = await doctorApi.approveDoctor(userId, notes);
            if (res.success) {
                alert('Doctor approved successfully!');
                setNotes('');
                setSelectedDoctor(null);
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId) => {
        if (!reason) {
            alert('Please provide a rejection reason');
            return;
        }
        setActionLoading(userId);
        try {
            const res = await doctorApi.rejectDoctor(userId, reason);
            if (res.success) {
                alert('Doctor rejected');
                setReason('');
                setSelectedDoctor(null);
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject doctor');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="dv-container">
            {/* Header */}
            <header className="dv-header">
                <div className="dv-header-inner">
                    <div className="dv-header-left">
                        <div className="dv-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                        </div>
                        <div className="dv-header-text">
                            <h1 className="dv-header-title">Doctor Verification</h1>
                            <p className="dv-header-subtitle">Review and approve healthcare professional credentials</p>
                        </div>
                    </div>
                    <button className="dv-back-btn" onClick={() => navigate('/admin/dashboard')}>
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="dv-content">
                {/* Stats Bar */}
                {stats && (
                    <div className="dv-stats-bar">
                        <div className="dv-stat-card">
                            <div className="dv-stat-value">{stats.pending}</div>
                            <div className="dv-stat-label">Pending Review</div>
                        </div>
                        <div className="dv-stat-card">
                            <div className="dv-stat-value">{stats.verified}</div>
                            <div className="dv-stat-label">Verified Doctors</div>
                        </div>
                        <div className="dv-stat-card">
                            <div className="dv-stat-value">{stats.rejected}</div>
                            <div className="dv-stat-label">Rejected</div>
                        </div>
                    </div>
                )}

                {/* Main Section */}
                <div className="dv-main-card">
                    <div className="dv-card-header">
                        <div className="dv-tabs">
                            <button
                                className={`dv-tab ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending Verifications
                            </button>
                        </div>
                    </div>

                    <div className="dv-table-container">
                        {loading ? (
                            <div className="dv-loading">Loading verifications...</div>
                        ) : pendingDoctors.length === 0 ? (
                            <div className="dv-empty">No pending verifications found</div>
                        ) : (
                            <table className="dv-table">
                                <thead>
                                    <tr>
                                        <th>Doctor Name</th>
                                        <th>Email</th>
                                        <th>Registration Date</th>
                                        <th>Documents</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingDoctors.map(doctor => (
                                        <tr key={doctor.id}>
                                            <td>
                                                <div className="dv-doctor-name">
                                                    Dr. {doctor.first_name} {doctor.last_name}
                                                </div>
                                            </td>
                                            <td>{doctor.email}</td>
                                            <td>{new Date(doctor.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className="dv-doc-count">
                                                    {doctor.document_count} Documents Attached
                                                </span>
                                            </td>
                                            <td>
                                                <div className="dv-actions">
                                                    <button
                                                        className="dv-btn-review"
                                                        onClick={() => setSelectedDoctor(doctor)}
                                                    >
                                                        Review credentials
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {selectedDoctor && (
                <div className="dv-modal-overlay">
                    <div className="dv-modal">
                        <div className="dv-modal-header">
                            <h2>Review Doctor: Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
                            <button className="dv-modal-close" onClick={() => setSelectedDoctor(null)}>×</button>
                        </div>
                        <div className="dv-modal-body">
                            <div className="dv-review-section">
                                <h3>Credentials & Documents</h3>
                                <p className="dv-info-text">Documents would be listed here for verification. The doctor has uploaded {selectedDoctor.document_count} files.</p>

                                <div className="dv-action-groups">
                                    <div className="dv-action-box approve">
                                        <h4>Approve Account</h4>
                                        <textarea
                                            placeholder="Approval notes (optional)"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>
                                        <button
                                            className="dv-btn-approve"
                                            onClick={() => handleApprove(selectedDoctor.id)}
                                            disabled={actionLoading === selectedDoctor.id}
                                        >
                                            {actionLoading === selectedDoctor.id ? 'Approving...' : 'Approve Doctor'}
                                        </button>
                                    </div>

                                    <div className="dv-action-box reject">
                                        <h4>Reject Account</h4>
                                        <textarea
                                            placeholder="Reason for rejection (required)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            required
                                        ></textarea>
                                        <button
                                            className="dv-btn-reject"
                                            onClick={() => handleReject(selectedDoctor.id)}
                                            disabled={actionLoading === selectedDoctor.id}
                                        >
                                            {actionLoading === selectedDoctor.id ? 'Rejecting...' : 'Reject Doctor'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorVerification;
