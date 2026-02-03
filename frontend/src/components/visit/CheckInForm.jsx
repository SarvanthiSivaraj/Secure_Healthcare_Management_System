// CheckInForm Component - Patient visit check-in
import React, { useState } from 'react';
import Button from '../common/Button';
import './CheckInForm.css';

function CheckInForm({ onCheckIn }) {
    const [visitCode, setVisitCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setVisitCode(value);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (visitCode.length !== 6) {
            setError('Please enter a 6-digit visit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onCheckIn(visitCode);
            setVisitCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed. Please verify your code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkin-form-container">
            <div className="checkin-header">
                <h3>Check In for Your Visit</h3>
                <p className="checkin-subtitle">Enter your 6-digit visit code to check in</p>
            </div>

            <form onSubmit={handleSubmit} className="checkin-form">
                <div className="visit-code-input-group">
                    <label htmlFor="visitCode" className="visit-code-label">
                        Visit Code
                    </label>
                    <input
                        type="text"
                        id="visitCode"
                        className="visit-code-input"
                        value={visitCode}
                        onChange={handleChange}
                        placeholder="000000"
                        maxLength="6"
                        autoComplete="off"
                        required
                    />
                    <div className="code-hint">
                        {visitCode.length}/6 digits
                    </div>
                </div>

                {error && (
                    <div className="checkin-error">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    loading={loading}
                    className="btn-primary btn-lg"
                    disabled={visitCode.length !== 6}
                >
                    Check In
                </Button>

                <div className="checkin-help">
                    <p>Don't have a visit code?</p>
                    <p className="help-text">Your visit code was sent to you via SMS/Email when your appointment was scheduled.</p>
                </div>
            </form>
        </div>
    );
}

export default CheckInForm;
