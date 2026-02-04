import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import './MedicalRecords.css';

function MedicalRecords() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, consultation, diagnosis, prescription, lab, imaging

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            // TODO: API call to fetch medical records
            // const data = await emrApi.getMyRecords();
            // setRecords(data.records || []);

            // Mock data for demonstration
            setRecords([
                {
                    id: 1,
                    type: 'CONSULTATION',
                    date: '2026-02-01',
                    doctor: 'Dr. Sarah Johnson',
                    title: 'Annual Checkup',
                    summary: 'Routine physical examination. Patient in good health.',
                },
                {
                    id: 2,
                    type: 'DIAGNOSIS',
                    date: '2026-02-01',
                    doctor: 'Dr. Sarah Johnson',
                    title: 'Hypertension (I10)',
                    summary: 'Mild hypertension detected. Lifestyle modifications recommended.',
                },
                {
                    id: 3,
                    type: 'PRESCRIPTION',
                    date: '2026-02-01',
                    doctor: 'Dr. Sarah Johnson',
                    title: 'Lisinopril 10mg',
                    summary: 'Take once daily in the morning.',
                },
            ]);
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        if (filter === 'all') return records;
        return records.filter(r => r.type.toLowerCase() === filter);
    };

    const filteredRecords = filterRecords();

    const getRecordIcon = (type) => {
        switch (type) {
            case 'CONSULTATION': return '📋';
            case 'DIAGNOSIS': return '🔍';
            case 'PRESCRIPTION': return '💊';
            case 'LAB': return '🔬';
            case 'IMAGING': return '🏥';
            default: return '📄';
        }
    };

    return (
        <div className="medical-records-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>My Medical Records</h1>
                    <p className="page-subtitle">Complete history of your healthcare data</p>
                </div>
                <Button onClick={() => navigate('/patient/dashboard')} variant="secondary">
                    Back to Dashboard
                </Button>
            </header>

            <div className="records-content">
                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Records
                    </button>
                    <button
                        className={`filter-tab ${filter === 'consultation' ? 'active' : ''}`}
                        onClick={() => setFilter('consultation')}
                    >
                        📋 Consultations
                    </button>
                    <button
                        className={`filter-tab ${filter === 'diagnosis' ? 'active' : ''}`}
                        onClick={() => setFilter('diagnosis')}
                    >
                        🔍 Diagnoses
                    </button>
                    <button
                        className={`filter-tab ${filter === 'prescription' ? 'active' : ''}`}
                        onClick={() => setFilter('prescription')}
                    >
                        💊 Prescriptions
                    </button>
                    <button
                        className={`filter-tab ${filter === 'lab' ? 'active' : ''}`}
                        onClick={() => setFilter('lab')}
                    >
                        🔬 Lab Results
                    </button>
                    <button
                        className={`filter-tab ${filter === 'imaging' ? 'active' : ''}`}
                        onClick={() => setFilter('imaging')}
                    >
                        🏥 Imaging
                    </button>
                </div>

                {/* Records Timeline */}
                <div className="records-timeline">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading medical records...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="empty-state">
                            <p>No {filter !== 'all' ? filter : ''} records found</p>
                            <p className="empty-hint">Your medical records will appear here</p>
                        </div>
                    ) : (
                        filteredRecords.map((record) => (
                            <div key={record.id} className="record-card">
                                <div className="record-icon">
                                    {getRecordIcon(record.type)}
                                </div>
                                <div className="record-content">
                                    <div className="record-header">
                                        <div>
                                            <h3 className="record-title">{record.title}</h3>
                                            <p className="record-meta">
                                                {record.doctor} • {new Date(record.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="record-type-badge">
                                            {record.type}
                                        </span>
                                    </div>
                                    <p className="record-summary">{record.summary}</p>
                                    <div className="record-actions">
                                        <button className="action-btn">View Details</button>
                                        <button className="action-btn">Download</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Read-Only Notice */}
                <div className="info-box">
                    <h3>🔒 Read-Only Access</h3>
                    <ul>
                        <li>You can view all your medical records</li>
                        <li>Records cannot be edited or deleted by patients</li>
                        <li>Only authorized healthcare providers can add records</li>
                        <li>All access is logged for your security</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default MedicalRecords;
