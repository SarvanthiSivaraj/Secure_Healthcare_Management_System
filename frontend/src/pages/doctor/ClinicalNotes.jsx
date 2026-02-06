import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ClinicalNotesEditor from '../../components/clinical/ClinicalNotesEditor';
import PrescriptionForm from '../../components/clinical/PrescriptionForm';
import DiagnosisSelector from '../../components/clinical/DiagnosisSelector';
import './ClinicalNotes.css';

function ClinicalNotes() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const visitId = searchParams.get('visitId') || 'V-2024-001';
    const patientId = searchParams.get('patientId') || 'P12345';

    const [activeTab, setActiveTab] = useState('notes');
    const [prescriptions, setPrescriptions] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);

    const handleSaveNotes = (notes) => {
        // TODO: API call to save notes
        alert('Clinical notes saved successfully!');
        console.log('Saved notes:', notes);
    };

    const handleAddPrescription = (prescription) => {
        setPrescriptions([...prescriptions, { ...prescription, id: Date.now() }]);
        setShowPrescriptionForm(false);
    };

    const handleRemovePrescription = (id) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    const handleAddDiagnosis = (diagnosis) => {
        setDiagnoses([...diagnoses, { ...diagnosis, id: Date.now() }]);
        setShowDiagnosisForm(false);
    };

    const handleRemoveDiagnosis = (id) => {
        setDiagnoses(diagnoses.filter(d => d.id !== id));
    };

    return (
        <div className="clinical-notes-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Clinical Notes</h1>
                    <p className="page-subtitle">
                        Visit: {visitId} | Patient: {patientId}
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/doctor/dashboard')}
                >
                    Back to Dashboard
                </button>
            </header>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    📝 SOAP Notes
                </button>
                <button
                    className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prescriptions')}
                >
                    💊 Prescriptions
                    {prescriptions.length > 0 && (
                        <span className="tab-badge">{prescriptions.length}</span>
                    )}
                </button>
                <button
                    className={`tab ${activeTab === 'diagnoses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('diagnoses')}
                >
                    🩺 Diagnoses
                    {diagnoses.length > 0 && (
                        <span className="tab-badge">{diagnoses.length}</span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="page-content">
                {activeTab === 'notes' && (
                    <ClinicalNotesEditor
                        visitId={visitId}
                        patientId={patientId}
                        onSave={handleSaveNotes}
                        onCancel={() => navigate('/doctor/dashboard')}
                    />
                )}

                {activeTab === 'prescriptions' && (
                    <div className="prescriptions-tab">
                        {!showPrescriptionForm && (
                            <>
                                <div className="tab-header">
                                    <h3>Prescriptions for this Visit</h3>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowPrescriptionForm(true)}
                                    >
                                        + Add Prescription
                                    </button>
                                </div>

                                {prescriptions.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">💊</div>
                                        <p>No prescriptions added yet</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowPrescriptionForm(true)}
                                        >
                                            Add First Prescription
                                        </button>
                                    </div>
                                ) : (
                                    <div className="prescriptions-list">
                                        {prescriptions.map((rx) => (
                                            <div key={rx.id} className="prescription-card">
                                                <div className="card-header">
                                                    <h4>{rx.medication}</h4>
                                                    <button
                                                        className="btn-remove"
                                                        onClick={() => handleRemovePrescription(rx.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="card-details">
                                                    <div className="detail-item">
                                                        <span className="label">Dosage:</span>
                                                        <span className="value">{rx.dosage}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Frequency:</span>
                                                        <span className="value">{rx.frequency}</span>
                                                    </div>
                                                    {rx.duration && (
                                                        <div className="detail-item">
                                                            <span className="label">Duration:</span>
                                                            <span className="value">{rx.duration}</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <span className="label">Route:</span>
                                                        <span className="value">{rx.route}</span>
                                                    </div>
                                                    {rx.instructions && (
                                                        <div className="detail-item full-width">
                                                            <span className="label">Instructions:</span>
                                                            <span className="value">{rx.instructions}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {showPrescriptionForm && (
                            <PrescriptionForm
                                onAdd={handleAddPrescription}
                                onCancel={() => setShowPrescriptionForm(false)}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'diagnoses' && (
                    <div className="diagnoses-tab">
                        {!showDiagnosisForm && (
                            <>
                                <div className="tab-header">
                                    <h3>Diagnoses for this Visit</h3>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowDiagnosisForm(true)}
                                    >
                                        + Add Diagnosis
                                    </button>
                                </div>

                                {diagnoses.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">🩺</div>
                                        <p>No diagnoses added yet</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowDiagnosisForm(true)}
                                        >
                                            Add First Diagnosis
                                        </button>
                                    </div>
                                ) : (
                                    <div className="diagnoses-list">
                                        {diagnoses.map((dx) => (
                                            <div key={dx.id} className="diagnosis-card">
                                                <div className="card-header">
                                                    <div className="diagnosis-title">
                                                        <span className="icd-code">{dx.code}</span>
                                                        <h4>{dx.description}</h4>
                                                    </div>
                                                    <button
                                                        className="btn-remove"
                                                        onClick={() => handleRemoveDiagnosis(dx.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="card-badges">
                                                    <span className={`badge badge-${dx.type.toLowerCase()}`}>
                                                        {dx.type}
                                                    </span>
                                                    <span className={`badge badge-${dx.status.toLowerCase()}`}>
                                                        {dx.status}
                                                    </span>
                                                </div>
                                                {dx.notes && (
                                                    <div className="diagnosis-notes">
                                                        <strong>Notes:</strong> {dx.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {showDiagnosisForm && (
                            <DiagnosisSelector
                                onAdd={handleAddDiagnosis}
                                onCancel={() => setShowDiagnosisForm(false)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClinicalNotes;
