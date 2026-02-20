import React, { useState } from 'react';
import Button from '../common/Button';

function GovernancePanel({ roleLabel, scopeLabel = 'Treatment → Assigned Visit Only' }) {
    const [emergencyActive, setEmergencyActive] = useState(false);
    const [justification, setJustification] = useState('');

    const activateEmergency = () => {
        if (!justification.trim()) return;
        setEmergencyActive(true);
    };

    const deactivateEmergency = () => {
        setEmergencyActive(false);
    };

    return (
        <section className="governance-section" aria-label="Governance and Privacy">
            <h2 className="section-title">Security & Governance</h2>

            <div className="governance-grid">
                <div className="governance-card">
                    <h3>Consent Indicator</h3>
                    <ul className="governance-list">
                        <li>Active consent: Yes</li>
                        <li>Scope: {scopeLabel}</li>
                        <li>Expiry: 3h remaining</li>
                    </ul>
                </div>

                <div className="governance-card">
                    <h3>Access Scope Banner</h3>
                    <p className="governance-banner">
                        Access granted for: Visit #3421 | Scope: {scopeLabel} | Expires in: 3h
                    </p>
                </div>

                <div className="governance-card">
                    <h3>Audit Trail Capture</h3>
                    <ul className="governance-list">
                        <li>Every action is logged: view, edit, upload, download</li>
                        <li>Audit metadata: role, timestamp, action type, resource</li>
                        <li>Modification attempts are captured and flagged</li>
                    </ul>
                </div>

                <div className="governance-card">
                    <h3>Privacy Guardrails</h3>
                    <ul className="governance-list">
                        <li>Field masking enabled for sensitive identifiers</li>
                        <li>Auto logout: 15 minutes inactivity</li>
                        <li>Session expiry enforced with token validation</li>
                        <li>Device trust check: active for this session</li>
                    </ul>
                </div>
            </div>

            <div className="breakglass-panel">
                <h3>Break-Glass Indicator</h3>
                {!emergencyActive ? (
                    <div className="breakglass-controls">
                        <input
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="breakglass-input"
                            placeholder={`Enter emergency justification for ${roleLabel} access`}
                        />
                        <Button onClick={activateEmergency} disabled={!justification.trim()}>
                            Activate Emergency Access
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="breakglass-banner">
                            Emergency access active | Justification: {justification} | Timer: 00:30:00
                        </div>
                        <Button variant="secondary" onClick={deactivateEmergency}>Deactivate Emergency Access</Button>
                    </>
                )}
            </div>
        </section>
    );
}

export default GovernancePanel;
