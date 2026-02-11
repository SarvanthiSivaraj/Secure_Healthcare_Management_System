// VisitCard Component - Display individual visit information
import React from 'react';
import './VisitCard.css';

function VisitCard({ visit, onAction, showActions = true, userRole = 'patient' }) {
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'SCHEDULED': 'status-scheduled',
            'CHECKED_IN': 'status-checked-in',
            'ACTIVE': 'status-active',
            'COMPLETED': 'status-completed',
        };
        return statusMap[status] || 'status-scheduled';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="visit-card">
            <div className="visit-card-header">
                <div className="visit-info">
                    <h3 className="visit-doctor">
                        {userRole === 'patient'
                            ? (visit.doctorName && visit.doctorName !== 'Unassigned' ? `Dr. ${visit.doctorName}` : 'Pending Assignment')
                            : visit.patientName}
                    </h3>
                    <p className="visit-specialization">{visit.specialization || 'General Consultation'}</p>
                </div>
                <span className={`visit-status-badge ${getStatusBadgeClass(visit.status)}`}>
                    {visit.status}
                </span>
            </div>

            <div className="visit-details">
                <div className="visit-detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                        {visit.scheduledTime ? formatDate(visit.scheduledTime) : 'Not Scheduled Yet'}
                    </span>
                </div>
                <div className="visit-detail-row">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">
                        {visit.scheduledTime ? formatTime(visit.scheduledTime) : 'Not Scheduled Yet'}
                    </span>
                </div>
                {visit.visitCode && userRole === 'patient' && (
                    <div className="visit-detail-row">
                        <span className="detail-label">Visit Code</span>
                        <span className="detail-value visit-code">{visit.visitCode}</span>
                    </div>
                )}
                {visit.visitType && (
                    <div className="visit-detail-row">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{visit.visitType}</span>
                    </div>
                )}
            </div>

            {showActions && onAction && (
                <div className="visit-card-actions">
                    {userRole === 'staff' && visit.status === 'CHECKED_IN' && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onAction('activate', visit.id)}
                        >
                            Activate Visit
                        </button>
                    )}
                    {userRole === 'doctor' && visit.status === 'ACTIVE' && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onAction('view', visit.id)}
                        >
                            View Details
                        </button>
                    )}
                    {(userRole === 'staff' || userRole === 'doctor') && visit.status === 'ACTIVE' && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onAction('close', visit.id)}
                        >
                            Close Visit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default VisitCard;
