import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientRecords.css';

function ClinicalNotes() {
    const navigate = useNavigate();

    return (
        <div className="clinical-notes-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Clinical Notes</h1>
                    <p className="page-subtitle">Create and update patient consultation notes and prescriptions</p>
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

export default ClinicalNotes;
