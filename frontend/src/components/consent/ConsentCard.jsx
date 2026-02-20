import React from 'react';
import Button from '../common/Button';
import './ConsentCard.css';
function ConsentCard({ consent, onRevoke, onEdit }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        // Parse UTC string and display in local time
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Correctly check expiry using timestamps
    const getIsExpired = () => {
        if (!consent.endTime) return false;
        return new Date(consent.endTime).getTime() < new Date().getTime();
    };

    // Check active status based on database status + expiry check
    const isExpired = getIsExpired();
    // Also consider backend's isActive flag if available, for double verification
    const isActive = (consent.status?.toUpperCase() === 'ACTIVE') && !isExpired;
    const formatCategory = (category) => {
        const categories = {
            'all_medical_data': 'All Medical Data',
            'diagnoses': 'Diagnoses Only',
            'prescriptions': 'Prescriptions Only',
            'lab_results': 'Lab Results Only',
            'imaging': 'Imaging Reports Only',
            'vital_signs': 'Vitals Only',
            'clinical_notes': 'Clinical Notes',
            'allergies': 'Allergies',
            'immunizations': 'Immunizations',
            'procedures': 'Procedures'
        };
        return categories[category] || category;
    };

    const formatPurpose = (purpose) => {
        const purposes = {
            'treatment': 'Treatment',
            'consultation': 'Consultation',
            'second_opinion': 'Second Opinion',
            'clinical_research': 'Research (Anonymized)',
            'medical_study': 'Medical Study',
            'active': 'Active',
            'revoked': 'Revoked',
            'expired': 'Expired'
        };
        return purposes[purpose] || purpose.charAt(0).toUpperCase() + purpose.slice(1).replace(/_/g, ' ');
    };

    const formatAccess = (access) => {
        return access === 'write' ? 'Read & Write' : 'Read Only';
    };

    const [remainingTime, setRemainingTime] = React.useState('');

    React.useEffect(() => {
        if (!consent.endTime) {
            setRemainingTime('Indefinite (Unlimited)');
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(consent.endTime);
            const total = end.getTime() - now.getTime();

            if (total <= 0) {
                setRemainingTime('Expired');
                return;
            }

            // const days = Math.floor(total / (1000 * 60 * 60 * 24));
            const totalHours = Math.floor(total / (1000 * 60 * 60)); // Total hours remaining
            const minutes = Math.floor((total / 1000 / 60) % 60);
            const seconds = Math.floor((total / 1000) % 60);

            // If days > 0, we can still show them, or just show total hours as requested.
            // User said: "if i give 25hrs, it says 6hrs remaing. fix that too."
            // This implies they want to see "25h ..." or accurate total time.
            // Since we removed "days" input, let's show total hours if it's less than say 48h, or just stick to a clean format.
            // Let's use a composite format: "Xh Ym Zs" where X is total hours.

            setRemainingTime(`${totalHours}h ${minutes}m ${seconds}s remaining`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [consent.endTime]);

    return (
        <div className={`consent-card ${isExpired ? 'inactive' : (isActive ? 'active' : 'inactive')} bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-400 transition-all p-5`}>
            <div className="consent-header">
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold">Dr. {consent.recipientName}</h4>
                    <span className="consent-specialization">{consent.specialization}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className={`consent-status ${isExpired ? 'expired' : consent.status.toLowerCase()}`}>
                        {isExpired ? 'EXPIRED' : consent.status}
                    </span>
                    {isActive && consent.endTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-right">
                            {remainingTime}
                        </span>
                    )}
                </div>
            </div>
            <div className="consent-details text-gray-700 dark:text-gray-300">
                <div className="consent-detail-row">
                    <span className="detail-label font-medium text-gray-500 dark:text-gray-400">Data Category:</span>
                    <span className="detail-value">{formatCategory(consent.dataCategory)}</span>
                </div>
                <div className="consent-detail-row">
                    <span className="detail-label font-medium text-gray-500 dark:text-gray-400">Purpose:</span>
                    <span className="detail-value">{formatPurpose(consent.purpose)}</span>
                </div>
                <div className="consent-detail-row">
                    <span className="detail-label font-medium text-gray-500 dark:text-gray-400">Access Level:</span>
                    <span className="detail-value">{formatAccess(consent.accessLevel)}</span>
                </div>
            </div>
            <div className="consent-card-footer border-t border-gray-100 dark:border-slate-700 pt-3 mt-3">
                <div className="consent-dates text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                    <span>From: {formatDate(consent.startTime)}</span>
                    <span className={isExpired ? 'text-danger' : ''}>
                        To: {formatDate(consent.endTime)}
                    </span>
                </div>

                {/* Only show actions if consent is active */}
                {isActive && (
                    <div className="consent-actions">
                        <Button
                            variant="primary"
                            size="sm"
                            className="btn-edit"
                            onClick={() => onEdit(consent)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            className="btn-revoke"
                            onClick={() => onRevoke(consent.id)}
                        >
                            Revoke
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
export default ConsentCard;