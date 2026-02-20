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
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            {/* Header */}
            <header className="bg-gradient-to-r from-primary-700 to-primary-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Clinical Notes</h1>
                            <p className="text-primary-100 text-sm">Visit: {visitId} | Patient: {patientId}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Back to Dashboard
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex gap-2 border-b border-gray-200 dark:border-dark-border">
                    {[
                        { key: 'notes', label: 'SOAP Notes', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, badge: null },
                        { key: 'prescriptions', label: 'Prescriptions', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, badge: prescriptions.length },
                        { key: 'diagnoses', label: 'Diagnoses', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, badge: diagnoses.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 ${activeTab === tab.key
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-500 text-white text-xs font-bold">{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
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
                                        <div className="empty-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#54ACBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 12h6m-3-3v6M3 6l3-3 3 3m6 0l3-3 3 3M5 20h14a2 2 0 002-2V7H3v11a2 2 0 002 2z" />
                                            </svg>
                                        </div>
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
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
                                        <div className="empty-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#54ACBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                            </svg>
                                        </div>
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
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
