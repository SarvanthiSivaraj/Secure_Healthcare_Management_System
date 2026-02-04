import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientRecords.css';

function PatientRecords() {
    const navigate = useNavigate();

    return (
        <div className="patient-records-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Patient Records</h1>
                    <p className="page-subtitle">Access and manage patient medical records with consent verification</p>
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

export default PatientRecords;
