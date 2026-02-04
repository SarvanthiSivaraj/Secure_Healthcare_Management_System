import React, { useState } from 'react';
import Button from '../common/Button';
import './EmergencyToggle.css';

function EmergencyToggle({ isActive, onToggle }) {
    const [showModal, setShowModal] = useState(false);
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);

    const handleActivate = () => {
        setShowModal(true);
    };

    const handleDeactivate = async () => {
        setLoading(true);
        try {
            // TODO: API call to deactivate emergency mode
            // await emergencyApi.deactivate();
            console.log('Emergency mode deactivated');
            if (onToggle) onToggle(false);
        } catch (error) {
            console.error('Failed to deactivate emergency mode:', error);
            alert('Failed to deactivate emergency mode');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitJustification = async () => {
        if (!justification.trim()) {
            alert('Justification is required for emergency access');
            return;
        }

        setLoading(true);
        try {
            // TODO: API call to activate emergency mode
            // await emergencyApi.activate(justification);
            console.log('Emergency mode activated:', justification);
            if (onToggle) onToggle(true);
            setShowModal(false);
            setJustification('');
        } catch (error) {
            console.error('Failed to activate emergency mode:', error);
            alert('Failed to activate emergency mode');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`emergency-toggle-container ${isActive ? 'active' : ''}`}>
                <div className="toggle-content">
                    <div className="toggle-info">
                        <span className="toggle-icon">{isActive ? '🚨' : '🔓'}</span>
                        <div>
                            <h4 className="toggle-title">
                                {isActive ? 'Emergency Mode Active' : 'Emergency Access'}
                            </h4>
                            <p className="toggle-description">
                                {isActive
                                    ? 'Break-glass access enabled. All actions are logged.'
                                    : 'Activate for critical patient emergencies'}
                            </p>
                        </div>
                    </div>

                    {isActive ? (
                        <Button onClick={handleDeactivate} variant="secondary" loading={loading}>
                            Deactivate
                        </Button>
                    ) : (
                        <Button onClick={handleActivate}>
                            Activate Emergency Mode
                        </Button>
                    )}
                </div>

                {isActive && (
                    <div className="emergency-timer">
                        <span className="timer-icon">⏱️</span>
                        <span>Auto-expires in 30 minutes</span>
                    </div>
                )}
            </div>

            {/* Justification Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🚨 Emergency Access Justification</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="warning-notice">
                                <span className="warning-icon">⚠️</span>
                                <div>
                                    <strong>Critical Action Required</strong>
                                    <p>Emergency access bypasses consent. Patient will be notified. All actions are logged and auditable.</p>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Justification <span className="required">*</span>
                                </label>
                                <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    className="textarea-field"
                                    rows="4"
                                    placeholder="Describe the emergency situation requiring immediate access..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitJustification} loading={loading}>
                                Activate Emergency Access
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EmergencyToggle;
