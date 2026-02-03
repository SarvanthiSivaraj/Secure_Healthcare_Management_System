import React from 'react';
import Button from '../common/Button';
import './ConsentCard.css';
function ConsentCard({ consent, onRevoke }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const isExpired = consent.endTime && new Date(consent.endTime) < new Date();
    const isActive = consent.status === 'ACTIVE' && !isExpired;
    return (
        <div className={`consent-card ${isActive ? 'active' : 'inactive'}`}>
            <div className="consent-header">
                <div>
                    <h4>Dr. {consent.recipientName}</h4>
                    <span className="consent-specialization">{consent.specialization}</span>
                </div>
                <span className={`consent-status ${consent.status.toLowerCase()}`}>
                    {consent.status}
                </span>
            </div>
            <div className="consent-details">
                <div className="consent-detail-row">
                    <span className="detail-label">Data Category:</span>
                    <span className="detail-value">{consent.dataCategory}</span>
                </div>
                <div className="consent-detail-row">
                    <span className="detail-label">Purpose:</span>
                    <span className="detail-value">{consent.purpose}</span>
                </div>
                <div className="consent-detail-row">
                    <span className="detail-label">Access Level:</span>
                    <span className="detail-value">{consent.accessLevel}</span>
                </div>
                <div className="consent-detail-row">
                    <span className="detail-label">Valid Period:</span>
                    <span className="detail-value">
                        {formatDate(consent.startTime)} - {consent.endTime ? formatDate(consent.endTime) : 'No expiry'}
                    </span>
                </div>
            </div>
            {isActive && (
                <div className="consent-actions">
                    <Button variant="danger" onClick={() => onRevoke(consent.id)}>
                        Revoke Access
                    </Button>
                </div>
            )}
        </div>
    );
}
export default ConsentCard;