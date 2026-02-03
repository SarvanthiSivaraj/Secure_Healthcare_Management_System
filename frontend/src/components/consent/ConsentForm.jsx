import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { consentApi } from '../../api/consentApi';
import './ConsentForm.css';
function ConsentForm({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        recipientUserId: '',
        dataCategory: 'ALL',
        purpose: 'TREATMENT',
        accessLevel: 'READ',
        startTime: new Date().toISOString().split('T')[0],
        endTime: '',
        temporary: false,
    });
    useEffect(() => {
        loadDoctors();
    }, []);
    const loadDoctors = async () => {
        try {
            const data = await consentApi.getAvailableDoctors();
            setDoctors(data);
        } catch (err) {
            console.error('Failed to load doctors:', err);
        }
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await consentApi.grantConsent(formData);
            onSuccess && onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to grant consent');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="consent-form-container">
            <h3>Grant Data Access Consent</h3>
            <p className="consent-subtitle">
                Control who can access your medical data and for what purpose
            </p>
            <form onSubmit={handleSubmit}>
                {/* Doctor Selection */}
                <div className="form-group">
                    <label htmlFor="recipientUserId">Grant Access To *</label>
                    <select
                        id="recipientUserId"
                        name="recipientUserId"
                        value={formData.recipientUserId}
                        onChange={handleChange}
                        required
                        className="form-select"
                    >
                        <option value="">Select a doctor...</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Data Category */}
                <div className="form-group">
                    <label htmlFor="dataCategory">Data Category *</label>
                    <select
                        id="dataCategory"
                        name="dataCategory"
                        value={formData.dataCategory}
                        onChange={handleChange}
                        required
                        className="form-select"
                    >
                        <option value="ALL">All Medical Data</option>
                        <option value="DIAGNOSES">Diagnoses Only</option>
                        <option value="PRESCRIPTIONS">Prescriptions Only</option>
                        <option value="LAB_RESULTS">Lab Results Only</option>
                        <option value="IMAGING">Imaging Reports Only</option>
                        <option value="VITALS">Vitals Only</option>
                    </select>
                </div>
                {/* Purpose */}
                <div className="form-group">
                    <label htmlFor="purpose">Purpose *</label>
                    <select
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                        className="form-select"
                    >
                        <option value="TREATMENT">Treatment</option>
                        <option value="CONSULTATION">Consultation</option>
                        <option value="SECOND_OPINION">Second Opinion</option>
                        <option value="RESEARCH">Research (Anonymized)</option>
                    </select>
                </div>
                {/* Access Level */}
                <div className="form-group">
                    <label htmlFor="accessLevel">Access Level *</label>
                    <select
                        id="accessLevel"
                        name="accessLevel"
                        value={formData.accessLevel}
                        onChange={handleChange}
                        required
                        className="form-select"
                    >
                        <option value="READ">Read Only</option>
                        <option value="WRITE">Read & Write</option>
                    </select>
                </div>
                {/* Time Range */}
                <div className="form-row">
                    <Input
                        label="Start Date"
                        type="date"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="End Date (Optional)"
                        type="date"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                    />
                </div>
                {/* Temporary Consent */}
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="temporary"
                        name="temporary"
                        checked={formData.temporary}
                        onChange={handleChange}
                    />
                    <label htmlFor="temporary">
                        This is a temporary consent (expires when visit ends)
                    </label>
                </div>
                {error && <div className="error-alert">{error}</div>}
                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        Grant Consent
                    </Button>
                </div>
            </form>
            <div className="consent-warning">
                ⚠️ <strong>Important:</strong> You can revoke this consent at any time.
                All access will be logged for your review.
            </div>
        </div>
    );
}
export default ConsentForm;