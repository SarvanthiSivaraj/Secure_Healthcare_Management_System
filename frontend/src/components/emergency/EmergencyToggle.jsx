import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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

    const modal = showModal && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Emergency Access Justification</h3>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-notice">
                        <svg className="warning-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
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
        </div>,
        document.body
    );

    return (
        <>
            <div className={`emergency-toggle-container ${isActive ? 'active' : ''}`}>
                <div className="toggle-content">
                    <div className="toggle-info">
                        <span className="toggle-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#ef4444' : '#f87171'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </span>
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
                        <Button onClick={handleDeactivate} variant="primary" loading={loading}>
                            Deactivate
                        </Button>
                    ) : (
                        <button
                            onClick={handleActivate}
                            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-red-500/30 hover:shadow-red-500/50"
                        >
                            Activate Emergency Mode
                        </button>
                    )}
                </div>

                {isActive && (
                    <div className="emergency-timer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Auto-expires in 30 minutes</span>
                    </div>
                )}
            </div>

            {modal}
        </>
    );
}

export default EmergencyToggle;
