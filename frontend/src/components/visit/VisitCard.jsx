// VisitCard Component - Display individual visit information
import React from 'react';
import './VisitCard.css';

function VisitCard({ visit, onAction, showActions = true, userRole = 'patient' }) {
    const getStatusBadgeClass = (status) => {
    const normalized = status?.toLowerCase();

    const statusMap = {
        pending: 'status-scheduled',
        approved: 'status-scheduled',
        checked_in: 'status-checked-in',
        in_progress: 'status-active',
        completed: 'status-completed',
        cancelled: 'status-completed',
    };

    return statusMap[normalized] || 'status-scheduled';
};

    const getProp = (obj, camel, snake) => obj && (obj[camel] || obj[snake]);

    const getVisitDate = () => {
        const dateStr = getProp(visit, 'scheduledTime', 'scheduled_time') ||
            getProp(visit, 'checkInTime', 'check_in_time') ||
            getProp(visit, 'createdAt', 'created_at');
        return dateStr ? new Date(dateStr) : new Date();
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const visitDate = getVisitDate();
    const visitCode = getProp(visit, 'visitCode', 'visit_code');
    const visitType = getProp(visit, 'visitType', 'type');

    return (
        <div className="visit-card">
            <div className="visit-card-header">
                <div className="visit-info">
                  <h3 className="visit-doctor">
                    {userRole === 'patient'
                        ? (
                            visit.doctorName && visit.doctorName !== 'Unassigned'
                                ? `Dr. ${visit.doctorName}`
                                : (visit.doctor_first_name
                                    ? `Dr. ${visit.doctor_first_name} ${visit.doctor_last_name}`
                                    : 'Pending Assignment')
                        )
                        : (
                            visit.patientName
                                || (visit.patient_first_name
                                    ? `${visit.patient_first_name} ${visit.patient_last_name}`
                                    : 'Unknown Patient')
                        )
                    }
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
                     <span className="detail-value">{formatDate(visitDate)}</span>
                    </div>
                    <div className="visit-detail-row">
                    <span className="detail-label">Time</span>
                        <span className="detail-value">{formatTime(visitDate)}</span>
                </div>
                {visitCode && userRole === 'patient' && (
                    <div className="visit-detail-row">
                        <span className="detail-label">Visit Code</span>
                        <span className="detail-value visit-code">{visitCode}</span>
                    </div>
                )}
                {visitType && (
                    <div className="visit-detail-row">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{visitType}</span>
                    </div>
                )}
            </div>

            {showActions && onAction && (
                <div className="visit-card-actions">
                    {userRole === 'staff' && visit.status?.toLowerCase() === 'checked_in' && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onAction('activate', visit.id)}
                        >
                            Activate Visit
                        </button>
                    )}

                    {userRole === 'doctor' && visit.status?.toLowerCase() === 'in_progress' && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onAction('view', visit.id)}
                        >
                            View Details
                        </button>
                    )}

                    {(userRole === 'staff' || userRole === 'doctor') &&
                    visit.status?.toLowerCase() === 'in_progress' && (
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
