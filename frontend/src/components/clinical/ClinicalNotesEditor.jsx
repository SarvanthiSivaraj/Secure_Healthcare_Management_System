import React, { useState } from 'react';
import './ClinicalNotesEditor.css';

function ClinicalNotesEditor({ visitId, patientId, onSave, onCancel }) {
    const [notes, setNotes] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        chiefComplaint: '',
        vitalSigns: {
            temperature: '',
            bloodPressure: '',
            heartRate: '',
            respiratoryRate: '',
            oxygenSaturation: '',
        }
    });
    const [saving, setSaving] = useState(false);

    const handleVitalChange = (field, value) => {
        setNotes(prev => ({
            ...prev,
            vitalSigns: {
                ...prev.vitalSigns,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave && onSave(notes);
        } catch (error) {
            console.error('Failed to save notes:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="clinical-notes-editor">
            <div className="editor-header">
                <h3>Clinical Notes - SOAP Format</h3>
                <p className="editor-subtitle">Visit ID: {visitId} | Patient ID: {patientId}</p>
            </div>

            {/* Chief Complaint */}
            <div className="form-section">
                <label className="section-label">Chief Complaint</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Patient's primary reason for visit..."
                    value={notes.chiefComplaint}
                    onChange={(e) => setNotes({ ...notes, chiefComplaint: e.target.value })}
                />
            </div>

            {/* Vital Signs */}
            <div className="form-section vitals-section">
                <label className="section-label">Vital Signs</label>
                <div className="vitals-grid">
                    <div className="form-group">
                        <label>Temperature (°F)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="98.6"
                            value={notes.vitalSigns.temperature}
                            onChange={(e) => handleVitalChange('temperature', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Blood Pressure</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="120/80"
                            value={notes.vitalSigns.bloodPressure}
                            onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Heart Rate (bpm)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="72"
                            value={notes.vitalSigns.heartRate}
                            onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Respiratory Rate</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="16"
                            value={notes.vitalSigns.respiratoryRate}
                            onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>O₂ Saturation (%)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="98"
                            value={notes.vitalSigns.oxygenSaturation}
                            onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* SOAP Notes */}
            <div className="soap-notes">
                {/* Subjective */}
                <div className="form-section">
                    <div className="section-title">
                        <span className="soap-letter">S</span>
                        Subjective
                    </div>
                    <p className="section-hint">Patient's description of symptoms, history, concerns</p>
                    <textarea
                        className="textarea-field"
                        rows="4"
                        placeholder="Patient reports..."
                        value={notes.subjective}
                        onChange={(e) => setNotes({ ...notes, subjective: e.target.value })}
                    />
                </div>

                {/* Objective */}
                <div className="form-section">
                    <div className="section-title">
                        <span className="soap-letter">O</span>
                        Objective
                    </div>
                    <p className="section-hint">Observable findings, examination results, test data</p>
                    <textarea
                        className="textarea-field"
                        rows="4"
                        placeholder="Physical examination reveals..."
                        value={notes.objective}
                        onChange={(e) => setNotes({ ...notes, objective: e.target.value })}
                    />
                </div>

                {/* Assessment */}
                <div className="form-section">
                    <div className="section-title">
                        <span className="soap-letter">A</span>
                        Assessment
                    </div>
                    <p className="section-hint">Diagnosis, clinical impression, differential diagnosis</p>
                    <textarea
                        className="textarea-field"
                        rows="4"
                        placeholder="Clinical assessment and diagnosis..."
                        value={notes.assessment}
                        onChange={(e) => setNotes({ ...notes, assessment: e.target.value })}
                    />
                </div>

                {/* Plan */}
                <div className="form-section">
                    <div className="section-title">
                        <span className="soap-letter">P</span>
                        Plan
                    </div>
                    <p className="section-hint">Treatment plan, follow-up, patient education</p>
                    <textarea
                        className="textarea-field"
                        rows="4"
                        placeholder="Treatment plan and recommendations..."
                        value={notes.plan}
                        onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
                <button
                    className="btn btn-secondary"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Notes'}
                </button>
            </div>
        </div>
    );
}

export default ClinicalNotesEditor;
