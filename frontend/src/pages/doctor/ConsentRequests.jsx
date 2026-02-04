import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientRecords.css';

function ConsentRequests() {
    const navigate = useNavigate();

    return (
        <div className="consent-requests-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Consent Requests</h1>
                    <p className="page-subtitle">Review and manage patient data access consent requests</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/doctor/dashboard')}
                >
                    Back to Dashboard
                </button>
            </header>

            <div className="page-content">
                {/* Content will be implemented */}
            </div>
        </div>
    );
}

export default ConsentRequests;
