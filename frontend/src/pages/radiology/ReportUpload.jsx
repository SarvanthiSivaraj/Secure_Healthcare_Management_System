import React, { useState, useRef, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { emrApi } from '../../api/emrApi';
import './ReportUpload.css';

const IMAGING_TYPES = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'Mammogram', 'DICOM', 'Other'];

function ReportUpload() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, logout } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    // Pre-fill from URL params (when coming from ImagingQueue)
    const prefillOrderId = searchParams.get('orderId') || '';
    const prefillVisitId = searchParams.get('visitId') || '';
    const prefillPatient = searchParams.get('patient') || '';
    const prefillType = searchParams.get('type') || '';

    const [form, setForm] = useState({
        orderId: prefillOrderId,
        visitId: prefillVisitId,
        patientName: prefillPatient,
        imagingType: prefillType || '',
        bodyPart: '',
        findings: '',
        impression: '',
        radiologistNotes: '',
        studyDate: new Date().toISOString().slice(0, 10),
    });

    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { success, message }
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleFile = (f) => {
        if (!f) return;
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/dicom', 'application/dicom'];
        const maxSize = 20 * 1024 * 1024; // 20 MB
        if (f.size > maxSize) {
            setErrors(prev => ({ ...prev, file: 'File size must be under 20 MB.' }));
            return;
        }
        setFile(f);
        setErrors(prev => ({ ...prev, file: undefined }));
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    }, []);

    const validate = () => {
        const errs = {};
        if (!form.visitId.trim()) errs.visitId = 'Visit ID is required.';
        if (!form.imagingType) errs.imagingType = 'Imaging type is required.';
        if (!form.findings.trim()) errs.findings = 'Findings are required.';
        if (!form.impression.trim()) errs.impression = 'Impression is required.';
        if (!file) errs.file = 'Please attach the imaging report file.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('visitId', form.visitId);
            formData.append('orderId', form.orderId);
            formData.append('imagingType', form.imagingType.toLowerCase().replace(' ', '_'));
            formData.append('bodyPart', form.bodyPart);
            formData.append('findings', form.findings);
            formData.append('impression', form.impression);
            formData.append('radiologistNotes', form.radiologistNotes);
            formData.append('studyDate', form.studyDate);
            formData.append('performedBy', user?.id || '');
            formData.append('file', file);

            await emrApi.uploadImagingReport(formData);

            setResult({ success: true, message: 'Imaging report uploaded successfully. Access has been logged.' });
            // Reset form
            setForm(prev => ({ ...prev, findings: '', impression: '', radiologistNotes: '', bodyPart: '' }));
            setFile(null);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Upload failed. Please check your connection and try again.';
            setResult({ success: false, message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ru-container">
            {/* Header */}
            <header className="ru-header">
                <div className="ru-header-content">
                    <div className="ru-header-left">
                        <button className="ru-back-btn" onClick={() => navigate('/radiology/queue')}>
                            ← Back to Queue
                        </button>
                        <div>
                            <h1>📤 Upload Imaging Report</h1>
                            <p className="ru-header-sub">Reports are securely stored and linked to the patient visit</p>
                        </div>
                    </div>
                    <button className="ru-signout-btn" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <div className="ru-content">
                {/* Access Notice */}
                <div className="ru-access-notice">
                    <span>🔒</span>
                    <span>
                        <strong>Secure Upload:</strong> This report will be cryptographically linked to the patient visit
                        and your radiologist ID. Uploads are immutable and fully audited.
                    </span>
                </div>

                {/* Success / Error Result */}
                {result && (
                    <div className={`ru-result-banner ${result.success ? 'success' : 'error'}`}>
                        {result.success ? '✅' : '❌'} {result.message}
                        {result.success && (
                            <button className="ru-go-queue-btn" onClick={() => navigate('/radiology/queue')}>
                                Back to Queue →
                            </button>
                        )}
                    </div>
                )}

                <form className="ru-form" onSubmit={handleSubmit} noValidate>
                    {/* Two-column grid */}
                    <div className="ru-form-grid">
                        {/* Visit ID */}
                        <div className="ru-field">
                            <label className="ru-label">Visit ID <span className="ru-req">*</span></label>
                            <input
                                className={`ru-input ${errors.visitId ? 'error' : ''}`}
                                name="visitId"
                                value={form.visitId}
                                onChange={handleChange}
                                placeholder="e.g. VST-001"
                            />
                            {errors.visitId && <span className="ru-field-error">{errors.visitId}</span>}
                        </div>

                        {/* Order ID */}
                        <div className="ru-field">
                            <label className="ru-label">Imaging Order ID</label>
                            <input
                                className="ru-input"
                                name="orderId"
                                value={form.orderId}
                                onChange={handleChange}
                                placeholder="Auto-filled from queue"
                            />
                        </div>

                        {/* Patient Name */}
                        <div className="ru-field">
                            <label className="ru-label">Patient Name</label>
                            <input
                                className="ru-input"
                                name="patientName"
                                value={form.patientName}
                                onChange={handleChange}
                                placeholder="Auto-filled from queue"
                            />
                        </div>

                        {/* Study Date */}
                        <div className="ru-field">
                            <label className="ru-label">Study Date</label>
                            <input
                                className="ru-input"
                                type="date"
                                name="studyDate"
                                value={form.studyDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Imaging Type */}
                        <div className="ru-field">
                            <label className="ru-label">Imaging Type <span className="ru-req">*</span></label>
                            <select
                                className={`ru-select ${errors.imagingType ? 'error' : ''}`}
                                name="imagingType"
                                value={form.imagingType}
                                onChange={handleChange}
                            >
                                <option value="">— Select type —</option>
                                {IMAGING_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            {errors.imagingType && <span className="ru-field-error">{errors.imagingType}</span>}
                        </div>

                        {/* Body Part */}
                        <div className="ru-field">
                            <label className="ru-label">Body Part / Region</label>
                            <input
                                className="ru-input"
                                name="bodyPart"
                                value={form.bodyPart}
                                onChange={handleChange}
                                placeholder="e.g. Chest, Brain, Abdomen"
                            />
                        </div>
                    </div>

                    {/* Findings */}
                    <div className="ru-field ru-field-full">
                        <label className="ru-label">Findings <span className="ru-req">*</span></label>
                        <textarea
                            className={`ru-textarea ${errors.findings ? 'error' : ''}`}
                            name="findings"
                            value={form.findings}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe the radiological findings in detail…"
                        />
                        {errors.findings && <span className="ru-field-error">{errors.findings}</span>}
                    </div>

                    {/* Impression */}
                    <div className="ru-field ru-field-full">
                        <label className="ru-label">Impression <span className="ru-req">*</span></label>
                        <textarea
                            className={`ru-textarea ${errors.impression ? 'error' : ''}`}
                            name="impression"
                            value={form.impression}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Clinical impression / diagnosis summary…"
                        />
                        {errors.impression && <span className="ru-field-error">{errors.impression}</span>}
                    </div>

                    {/* Radiologist Notes */}
                    <div className="ru-field ru-field-full">
                        <label className="ru-label">Additional Notes</label>
                        <textarea
                            className="ru-textarea"
                            name="radiologistNotes"
                            value={form.radiologistNotes}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Optional: follow-up recommendations, technical notes…"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="ru-field ru-field-full">
                        <label className="ru-label">Report File <span className="ru-req">*</span></label>
                        <div
                            className={`ru-dropzone ${dragOver ? 'drag-over' : ''} ${errors.file ? 'error' : ''} ${file ? 'has-file' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                            {file ? (
                                <div className="ru-file-info">
                                    <span className="ru-file-icon">📄</span>
                                    <div>
                                        <div className="ru-file-name">{file.name}</div>
                                        <div className="ru-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="ru-remove-file"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    >✕</button>
                                </div>
                            ) : (
                                <div className="ru-dropzone-placeholder">
                                    <span className="ru-upload-icon">🩻</span>
                                    <strong>Drag &amp; drop or click to upload</strong>
                                    <span>Supports PDF, JPEG, PNG, DICOM (.dcm) — max 20 MB</span>
                                </div>
                            )}
                        </div>
                        {errors.file && <span className="ru-field-error">{errors.file}</span>}
                    </div>

                    {/* Submit */}
                    <div className="ru-actions">
                        <button
                            type="button"
                            className="ru-cancel-btn"
                            onClick={() => navigate('/radiology/queue')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="ru-submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <><span className="ru-btn-spinner" /> Uploading…</>
                            ) : (
                                '📤 Submit Report'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportUpload;
