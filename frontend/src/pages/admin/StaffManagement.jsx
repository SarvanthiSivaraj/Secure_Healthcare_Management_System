import React, { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../../api/staffApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import '../patient/Dashboard.css';
import './StaffManagement.css';

function StaffManagement() {
    const [invitations, setInvitations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        role: 'NURSE',
        organizationId: '',
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [invitationsRes, statsRes] = await Promise.all([
                staffApi.getInvitations(),
                staffApi.getInvitationStats()
            ]);

            if (invitationsRes.success) {
                setInvitations(invitationsRes.data || []);
            }

            if (statsRes && statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await staffApi.inviteStaff(formData);
            if (response.success) {
                alert('Staff invitation sent successfully!');
                setShowInviteForm(false);
                setFormData({ email: '', role: 'NURSE', organizationId: '' });
                loadData(); // Reload invitations
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async (invitationId) => {
        try {
            const response = await staffApi.resendInvitation(invitationId);
            if (response.success) {
                alert('Invitation resent successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resend invitation');
        }
    };

    const handleCancel = async (invitationId) => {
        if (!window.confirm('Are you sure you want to cancel this invitation?')) {
            return;
        }

        try {
            const response = await staffApi.cancelInvitation(invitationId);
            if (response.success) {
                alert('Invitation cancelled successfully!');
                loadData(); // Reload invitations
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel invitation');
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            PENDING: 'status-badge status-pending',
            ACCEPTED: 'status-badge status-accepted',
            EXPIRED: 'status-badge status-expired',
            CANCELLED: 'status-badge status-cancelled',
        };

        return <span className={statusClasses[status] || 'status-badge'}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">Loading staff management...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Staff Management</h1>
                        <p className="header-subtitle">Invite and manage staff members</p>
                    </div>
                    <Button onClick={() => window.history.back()} variant="secondary">
                        ← Back
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Stats Overview */}
                {stats && (
                    <div className="stats-overview">
                        <div className="stat-item">
                            <div className="stat-number">{stats.total || 0}</div>
                            <div className="stat-label">Total Invitations</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{stats.pending || 0}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{stats.accepted || 0}</div>
                            <div className="stat-label">Accepted</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{stats.expired || 0}</div>
                            <div className="stat-label">Expired</div>
                        </div>
                    </div>
                )}

                {/* Invite Button */}
                <div className="action-bar">
                    <Button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                        className="btn-primary"
                    >
                        {showInviteForm ? '✕ Cancel' : '+ Invite Staff Member'}
                    </Button>
                </div>

                {/* Invite Form */}
                {showInviteForm && (
                    <div className="invite-form-container">
                        <h3>Send Staff Invitation</h3>
                        <form onSubmit={handleInviteSubmit} className="invite-form">
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="NURSE">Nurse</option>
                                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                                    <option value="RADIOLOGIST">Radiologist</option>
                                    <option value="PHARMACIST">Pharmacist</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <Input
                                label="Organization ID (Optional)"
                                type="text"
                                name="organizationId"
                                value={formData.organizationId}
                                onChange={handleChange}
                                placeholder="Leave blank for default organization"
                            />

                            {error && <div className="error-alert">{error}</div>}

                            <Button type="submit" loading={submitting} className="btn-primary">
                                Send Invitation
                            </Button>
                        </form>
                    </div>
                )}

                {/* Invitations List */}
                <div className="invitations-section">
                    <h2 className="section-title">Staff Invitations</h2>

                    {invitations.length === 0 ? (
                        <div className="empty-state">
                            <p>No invitations found. Click "Invite Staff Member" to get started.</p>
                        </div>
                    ) : (
                        <div className="invitations-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Sent Date</th>
                                        <th>Expires</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.map((invitation) => (
                                        <tr key={invitation.id}>
                                            <td>{invitation.email}</td>
                                            <td>{invitation.role}</td>
                                            <td>{getStatusBadge(invitation.status)}</td>
                                            <td>
                                                {new Date(invitation.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {invitation.expires_at
                                                    ? new Date(invitation.expires_at).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {(invitation.status === 'PENDING' || invitation.status === 'pending') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResend(invitation.id)}
                                                                className="btn-action btn-resend"
                                                                title="Resend invitation"
                                                            >
                                                                ↻
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(invitation.id)}
                                                                className="btn-action btn-cancel"
                                                                title="Cancel invitation"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StaffManagement;
