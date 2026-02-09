import React, { useState } from 'react';
import { visitApi } from '../../api/visitApi';
import './VerifyVisitOTP.css';

const VerifyVisitOTP = () => {
    const [visitId, setVisitId] = useState('');
    const [otp, setOtp] = useState('');
    const [accessLevel, setAccessLevel] = useState('read');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!visitId || !otp) {
            setError('Please enter visit ID and OTP');
            return;
        }

        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await visitApi.verifyVisitOTP(visitId, otp, accessLevel);

            setSuccess(true);
            setError(null);

            // Redirect after success
            setTimeout(() => {
                window.location.href = '/patient/visits';
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="verify-otp-container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h2>OTP Verified Successfully!</h2>
                    <p>Your doctor has been granted access to your medical records.</p>
                    <p className="redirect-text">Redirecting to visits...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-otp-container">
            <div className="verify-otp-card">
                <h2>Verify Hospital Visit OTP</h2>
                <p className="subtitle">Enter the OTP provided by the hospital</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Visit ID</label>
                        <input
                            type="text"
                            value={visitId}
                            onChange={(e) => setVisitId(e.target.value)}
                            placeholder="Enter your visit ID"
                            disabled={loading}
                        />
                        <small>You can find this in your visit confirmation</small>
                    </div>

                    <div className="form-group">
                        <label>OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                            className="otp-input"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Access Level</label>
                        <p className="access-level-description">
                            Choose what level of access to grant your doctor:
                        </p>

                        <div className="access-level-options">
                            <label className={`access-option ${accessLevel === 'read' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="accessLevel"
                                    value="read"
                                    checked={accessLevel === 'read'}
                                    onChange={(e) => setAccessLevel(e.target.value)}
                                    disabled={loading}
                                />
                                <div className="option-content">
                                    <div className="option-icon">🔍</div>
                                    <div className="option-text">
                                        <strong>Read Only</strong>
                                        <p>Doctor can view your medical records</p>
                                    </div>
                                </div>
                            </label>

                            <label className={`access-option ${accessLevel === 'write' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="accessLevel"
                                    value="write"
                                    checked={accessLevel === 'write'}
                                    onChange={(e) => setAccessLevel(e.target.value)}
                                    disabled={loading}
                                />
                                <div className="option-content">
                                    <div className="option-icon">✏️</div>
                                    <div className="option-text">
                                        <strong>Read & Write</strong>
                                        <p>Doctor can view and add records (prescriptions, notes, etc.)</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="verify-btn"
                        disabled={loading || !visitId || !otp}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP & Grant Access'}
                    </button>
                </form>

                <div className="info-box">
                    <strong>💡 Note:</strong>
                    <ul>
                        <li>OTP is valid for 24 hours</li>
                        <li>You can change access level later if needed</li>
                        <li>Your consent will be active for 30 days</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VerifyVisitOTP;
