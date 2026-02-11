import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { AuthContext } from '../../context/AuthContext';
import { emrApi } from '../../api/emrApi';
import '../patient/Dashboard.css'; // Shared dashboard theme
import './MedicalRecords.css';

function MedicalRecords() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedRecords, setExpandedRecords] = useState(new Set());

    const fetchRecords = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await emrApi.getPatientMedicalRecords(user.id);
            // Handle response structure: { success: true, data: { records: [] } }
            const recordList = response.data?.records || response.data || [];

            // Transform data to match UI expectations
            const formattedRecords = recordList.map(record => ({
                id: record.id,
                type: record.type, // consultation, diagnosis, prescription, lab_result, imaging, etc.
                date: record.created_at || record.visit_date,
                doctor: record.created_by_name || 'Unknown Provider',
                doctorRole: record.created_by_role || '',
                title: record.title,
                summary: record.description,
            }));

            setRecords(formattedRecords);
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        if (user && user.id) {
            fetchRecords();
        }
    }, [user, fetchRecords]);

    const filterRecords = () => {
        if (filter === 'all') return records;
        return records.filter(r => r.type === filter);
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

    const filteredRecords = filterRecords();

    const getRecordIcon = (type) => {
        switch (type) {
            case 'consultation': return '📋';
            case 'diagnosis': return '🔍';
            case 'prescription': return '💊';
            case 'lab_result': return '🔬';
            case 'imaging': return '🏥';
            case 'procedure': return '⚕️';
            case 'note': return '📝';
            default: return '📄';
        }
    };

    const formatRecordType = (type) => {
        const types = {
            'consultation': 'Consultation',
            'diagnosis': 'Diagnosis',
            'prescription': 'Prescription',
            'lab_result': 'Lab Result',
            'imaging': 'Imaging',
            'procedure': 'Procedure',
            'note': 'Clinical Note',
            'other': 'Other'
        };
        return types[type] || type;
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>My Medical Records</h1>
                        <p className="header-subtitle">Complete history of your healthcare data</p>
                    </div>
                    <Button onClick={() => navigate('/patient/dashboard')} variant="secondary">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
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
                        className={`filter-tab ${filter === 'lab_result' ? 'active' : ''}`}
                        onClick={() => setFilter('lab_result')}
                    >
                        🔬 Lab Results
                    </button>
                    <button
                        className={`filter-tab ${filter === 'imaging' ? 'active' : ''}`}
                        onClick={() => setFilter('imaging')}
                    >
                        🏥 Imaging
                    </button>
                    <button
                        className={`filter-tab ${filter === 'procedure' ? 'active' : ''}`}
                        onClick={() => setFilter('procedure')}
                    >
                        ⚕️ Procedures
                    </button>
                    <button
                        className={`filter-tab ${filter === 'note' ? 'active' : ''}`}
                        onClick={() => setFilter('note')}
                    >
                        📝 Notes
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
                            <p>No {filter !== 'all' ? formatRecordType(filter).toLowerCase() : ''} records found.</p>
                            <p className="empty-hint">
                                Medical records appear here after you have a consultation or procedure.
                                <br />They are added by your healthcare provider.
                            </p>
                        </div>
                    ) : (
                        filteredRecords.map((record) => {
                            const isExpanded = expandedRecords.has(record.id);
                            const shouldShowToggle = record.summary && record.summary.length > 150;

                            return (
                                <div key={record.id} className="record-card">
                                    <div className="record-icon">
                                        {getRecordIcon(record.type)}
                                    </div>
                                    <div className="record-content">
                                        <div className="record-header">
                                            <div>
                                                <h3 className="record-title">{record.title}</h3>
                                                <p className="record-meta">
                                                    {record.doctor} {record.doctorRole && `(${record.doctorRole})`} • {new Date(record.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="record-type-badge">
                                                {formatRecordType(record.type)}
                                            </span>
                                        </div>
                                        <p className={`record-summary ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                            {record.summary}
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
                                </div>
                            );
                        })
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
