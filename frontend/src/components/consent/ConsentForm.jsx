import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { consentApi } from '../../api/consentApi';
import './ConsentForm.css';
function ConsentForm({ onSuccess, onCancel, initialData }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [duration, setDuration] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [formData, setFormData] = useState({
        recipientUserId: '',
        dataCategory: 'all_medical_data',
        purpose: 'treatment',
        accessLevel: 'read',
        startTime: new Date().toISOString().split('T')[0],
        endTime: '',
    });

    // Handle unlimited (all 0s)
    const isUnlimited = duration.hours === 0 && duration.minutes === 0 && duration.seconds === 0;

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                recipientUserId: initialData.recipientUserId,
                dataCategory: initialData.dataCategory,
                purpose: initialData.purpose,
                accessLevel: initialData.accessLevel,
                startTime: new Date(initialData.startTime).toISOString().split('T')[0],
                endTime: initialData.endTime || '',
            });

            if (initialData.endTime) {
                const total = new Date(initialData.endTime).getTime() - new Date(initialData.startTime).getTime();
                // Convert total milliseconds to hours, minutes, seconds
                // We ignore days and convert everything to hours if needed, or just standard H:M:S breakdown
                // ensuring we capture meaningful time. 
                // However, user just wants to REMOVE the days input.
                // Standard logic:
                // Standard logic:
                // Calculate total hours directly
                const hours = Math.floor(total / (1000 * 60 * 60));
                const minutes = Math.floor((total / 1000 / 60) % 60);
                const seconds = Math.floor((total / 1000) % 60);
                setDuration({ hours, minutes, seconds });
            }
        }
    }, [initialData]);

    // Calculate end time and update live
    useEffect(() => {
        const interval = setInterval(() => {
            if (isUnlimited) {
                setFormData(prev => {
                    if (prev.endTime !== '') {
                        return { ...prev, endTime: '' };
                    }
                    return prev;
                });
                return;
            }

            // Let's calculate End Time first.
            let startDate;
            const now = new Date();

            // Create date object from input (UTC midnight)
            const inputDate = new Date(formData.startTime);
            // Create date object for "today" (UTC midnight) derived from NOW
            const todayDate = new Date(now.toISOString().split('T')[0]);

            // If selected date is today (or past in case of weirdness), use NOW as start time
            if (inputDate.getTime() <= todayDate.getTime()) {
                startDate = now;
            } else {
                startDate = inputDate;
            }

            // Let's calculate target end date.
            const totalSeconds = (parseInt(duration.hours || 0) * 3600) +
                (parseInt(duration.minutes || 0) * 60) +
                (parseInt(duration.seconds || 0));

            const end = new Date(startDate.getTime() + totalSeconds * 1000);

            setFormData(prev => {
                const newEndTime = end.toISOString();
                if (prev.endTime !== newEndTime) return { ...prev, endTime: newEndTime };
                return prev;
            });

        }, 1000);

        return () => clearInterval(interval);
    }, [duration, formData.startTime, isUnlimited]);

    const handleDurationChange = (e) => {
        const { name, value } = e.target;
        setDuration(prev => ({
            ...prev,
            [name]: Math.max(0, parseInt(value) || 0)
        }));
    };
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
        setLoading(true);
        setError('');

        try {
            // Prepare submission data
            const submitData = { ...formData };

            // If start date is today, use current time as start time
            // This prevents issues where "Today 00:00" vs "Today 14:00" causes validation errors
            // or where calculated endTime is properly in the future but startTime is ambiguous.
            const now = new Date();

            // Create date object from input (UTC midnight)
            const inputDate = new Date(submitData.startTime);
            // Create date object for "today" (UTC midnight) derived from NOW
            // Create date object for "today" (UTC midnight) derived from NOW
            const todayDate = new Date(now.toISOString().split('T')[0]);

            // If selected date is today (or past), use NOW as start time
            if (inputDate.getTime() <= todayDate.getTime()) {
                submitData.startTime = now.toISOString();

                // Recalculate endTime based on this precise start time + duration to be absolutely sure
                if (!isUnlimited) {
                    const totalSeconds = (parseInt(duration.hours || 0) * 3600) +
                        (parseInt(duration.minutes || 0) * 60) +
                        (parseInt(duration.seconds || 0));
                    const end = new Date(now.getTime() + totalSeconds * 1000);
                    submitData.endTime = end.toISOString();
                }
            }

            if (initialData) {
                // Update existing consent
                // Ensure we send all necessary fields, especially recipientUserId which might be disabled in UI
                // The state `formData` should already have it, but let's be sure.
                await consentApi.updateConsent(initialData.id, submitData);
            } else {
                // Create new consent
                await consentApi.grantConsent(submitData);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to process consent');
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
                        disabled={!!initialData}
                    >
                        <option value="">Select a doctor...</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                            </option>
                        ))}
                    </select>
                    {initialData && <small className="text-muted">Recipient cannot be changed when editing.</small>}
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
                        <option value="all_medical_data">All Medical Data</option>
                        <option value="diagnoses">Diagnoses Only</option>
                        <option value="prescriptions">Prescriptions Only</option>
                        <option value="lab_results">Lab Results Only</option>
                        <option value="imaging">Imaging Reports Only</option>
                        <option value="vital_signs">Vitals Only</option>
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
                        <option value="treatment">Treatment</option>
                        <option value="consultation">Consultation</option>
                        <option value="second_opinion">Second Opinion</option>
                        <option value="clinical_research">Research (Anonymized)</option>
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
                        <option value="read">Read Only</option>
                        <option value="write">Read & Write</option>
                    </select>
                </div>
                {/* Duration and Time Range */}
                <div className="form-row" style={{ alignItems: 'flex-start' }}>
                    <Input
                        label="Start Date"
                        type="date"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />

                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Duration</label>
                        <div className="duration-container">
                            <div className="duration-field">
                                <input
                                    type="number"
                                    name="hours"
                                    placeholder="0"
                                    value={duration.hours || ''}
                                    onChange={handleDurationChange}
                                    min="0"
                                />
                                <label>Hours</label>
                            </div>
                            <div className="duration-field">
                                <input
                                    type="number"
                                    name="minutes"
                                    placeholder="0"
                                    value={duration.minutes || ''}
                                    onChange={handleDurationChange}
                                    min="0" max="59"
                                />
                                <label>Mins</label>
                            </div>
                            <div className="duration-field">
                                <input
                                    type="number"
                                    name="seconds"
                                    placeholder="0"
                                    value={duration.seconds || ''}
                                    onChange={handleDurationChange}
                                    min="0" max="59"
                                />
                                <label>Secs</label>
                            </div>
                        </div>
                        <small className="text-muted">Set all to 0 for unlimited access.</small>
                    </div>
                </div>

                {/* Expiry Message */}
                <div className="info-alert" style={{ marginTop: '-10px', marginBottom: '15px' }}>
                    {isUnlimited ? (
                        <strong>♾️ Access will be valid indefinitely (Unlimited)</strong>
                    ) : (
                        formData.endTime && (
                            <>
                                📅 Access will expire on: <strong>{new Date(formData.endTime).toLocaleString()}</strong>
                                <br />
                                ⏳ Expires in: <strong>{duration.hours}h {duration.minutes}m {duration.seconds}s</strong>
                            </>
                        )
                    )}
                </div>
                {error && <div className="error-alert">{error}</div>}
                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (initialData ? 'Update Consent' : 'Grant Consent')}
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