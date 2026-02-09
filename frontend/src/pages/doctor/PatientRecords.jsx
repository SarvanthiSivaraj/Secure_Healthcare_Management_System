import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/common/Button';
import { getToken } from '../../utils/tokenManager';
import './PatientRecords.css';

function PatientRecords() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5003/api'}/consent/doctor/patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch patients:', err);
            setError('Failed to load patient records.');
            setLoading(false);
        }
    };

    return (
        <div className="patient-records-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Patient Records</h1>
                    <p className="page-subtitle">Access and manage patient medical records with consent verification</p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/doctor/dashboard')}>
                    Back to Dashboard
                </Button>
            </header>

            <div className="page-content">
                {loading ? (
                    <div className="loading-state">Loading patients...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : patients.length === 0 ? (
                    <div className="empty-state">
                        <p>No patients have granted you access yet.</p>
                    </div>
                ) : (
                    <div className="patients-grid">
                        {patients.map(patient => (
                            <div key={patient.id} className="patient-card">
                                <div className="patient-info">
                                    <h3>{patient.first_name} {patient.last_name}</h3>
                                    <p>Health ID: {patient.unique_health_id}</p>
                                    <p>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                    <p>Gender: {patient.gender}</p>
                                </div>
                                <div className="consent-info">
                                    <span className={`badge ${patient.access_level}`}>
                                        {patient.access_level.toUpperCase()} Access
                                    </span>
                                    <p className="expiry">
                                        Expires: {patient.consent_expires_at ? new Date(patient.consent_expires_at).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                                <div className="actions">
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate(`/doctor/patients/${patient.id}/records`)}
                                    >
                                        View Records
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientRecords;
