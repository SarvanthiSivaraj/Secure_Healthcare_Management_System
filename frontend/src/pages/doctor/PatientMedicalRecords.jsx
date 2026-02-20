import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/common/Button';
import AddMedicalRecordForm from '../../components/emr/AddMedicalRecordForm';
import { getToken } from '../../utils/tokenManager';
import './PatientRecords.css';

function PatientMedicalRecords() {
    const { id: patientId } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedRecords, setExpandedRecords] = useState(new Set());
    const [hasWriteAccess, setHasWriteAccess] = useState(false);
    const [hasReadAccess, setHasReadAccess] = useState(false);

    useEffect(() => {
        fetchPatientRecords();
        checkConsentAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    const checkConsentAccess = async () => {
        try {
            const token = getToken();
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

            // Get doctor's patient list which includes consent info
            const response = await axios.get(
                `${apiUrl}/consent/doctor/patients`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                const patients = response.data.data || [];

                // Filter all entries for this patient (one entry per consent category)
                // Note: The API returns 'id' for the user ID, not 'patient_id'
                const patientConsents = patients.filter(p => p.id === patientId);

                // Check for medical_records specific consent OR all_medical_data
                const medicalConsent = patientConsents.find(p =>
                    p.data_category === 'medical_records' ||
                    p.data_category === 'all_medical_data' ||
                    p.data_category === '*'
                );

                if (medicalConsent) {
                    setHasReadAccess(true);
                    setHasWriteAccess(medicalConsent.access_level === 'write');
                } else {
                    // No valid consent found
                    setHasReadAccess(false);
                    setHasWriteAccess(false);
                }
            }
        } catch (err) {
            console.error('Failed to check consent access:', err);
            // If we can't check consent, disable write access to be safe
            setHasWriteAccess(false);
            setHasReadAccess(false);
        }
    };

    const fetchPatientRecords = async () => {
        try {
            const token = getToken();
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

            const response = await axios.get(
                `${apiUrl}/emr/patients/${patientId}/medical-records`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // The response has structure: { success, data: { records, pagination } }
                const recordsData = response.data.data.records || [];
                setRecords(recordsData);

                // Extract patient info from first record if available
                if (recordsData.length > 0) {
                    setPatientInfo({
                        name: `${recordsData[0].patient_first_name || ''} ${recordsData[0].patient_last_name || ''}`.trim(),
                        healthId: recordsData[0].patient_health_id
                    });
                }
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch patient records:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load medical records.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatRecordType = (type) => {
        const types = {
            'consultation': 'Consultation',
            'diagnosis': 'Diagnosis',
            'prescription': 'Prescription',
            'lab_result': 'Lab Result',
            'imaging': 'Imaging Report',
            'procedure': 'Procedure',
            'note': 'Clinical Note',
            'other': 'Other'
        };
        return types[type] || type;
    };

    const toggleExpand = (recordId) => {
        setExpandedRecords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(recordId)) {
                newSet.delete(recordId);
            } else {
                newSet.add(recordId);
            }
            return newSet;
        });
    };

    const handleAddSuccess = () => {
        setShowAddForm(false);
        fetchPatientRecords(); // Refresh the records list
    };

    const handleAddCancel = () => {
        setShowAddForm(false);
    };

    return (
        <div className="patient-records-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Medical Records</h1>
                    {patientInfo && (
                        <p className="page-subtitle">
                            Patient: {patientInfo.name} | Health ID: {patientInfo.healthId}
                        </p>
                    )}
                </div>
                <div className="header-actions">
                    <Button
                        variant="primary"
                        onClick={() => setShowAddForm(!showAddForm)}
                        disabled={!hasWriteAccess || loading || error}
                        title={!hasWriteAccess ? "Write access required to add records" : ""}
                    >
                        {showAddForm ? 'Cancel' : 'Add Record'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/doctor/patients')}>
                        Back to Patient List
                    </Button>
                </div>
            </header>

            <div className="page-content">
                {!hasWriteAccess && hasReadAccess && !loading && (
                    <div className="info-message">
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#54ACBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <strong>Read-Only Access</strong> - You can view records but need write permission to add new records.
                        </p>
                    </div>
                )}

                {showAddForm && (
                    <AddMedicalRecordForm
                        patientId={patientId}
                        onSuccess={handleAddSuccess}
                        onCancel={handleAddCancel}
                    />
                )}

                {loading ? (
                    <div className="loading-state">Loading medical records...</div>
                ) : error ? (
                    <div className="error-message">
                        {error}
                        <br />
                        <small>You may not have consent to view this patient's records.</small>
                    </div>
                ) : records.length === 0 ? (
                    <div className="empty-state">
                        <p>No medical records found for this patient.</p>
                    </div>
                ) : (
                    <div className="records-list">
                        {records.map(record => {
                            const isExpanded = expandedRecords.has(record.id);
                            const shouldShowToggle = record.description && record.description.length > 150;

                            return (
                                <div key={record.id} className="record-card">
                                    <div className="record-header">
                                        <div>
                                            <span className="record-type-badge">
                                                {formatRecordType(record.type)}
                                            </span>
                                            <h3>{record.title}</h3>
                                        </div>
                                        <span className="record-date">{formatDate(record.created_at)}</span>
                                    </div>
                                    <div className="record-body">
                                        <div className="record-field">
                                            <strong>Description:</strong>
                                            <p className={isExpanded ? 'expanded' : 'collapsed'}>
                                                {record.description}
                                            </p>
                                            {shouldShowToggle && (
                                                <button
                                                    className="expand-btn"
                                                    onClick={() => toggleExpand(record.id)}
                                                >
                                                    {isExpanded ? 'Show Less' : 'Show More'}
                                                </button>
                                            )}
                                        </div>
                                        {record.created_by_name && (
                                            <div className="record-field">
                                                <strong>Created by:</strong>
                                                <p>{record.created_by_name} ({record.created_by_role})</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientMedicalRecords;
