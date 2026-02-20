import React from 'react';

function GovernancePanel({ roleLabel = 'staff', scopeLabel = 'Role-scoped access' }) {
    return (
        <section className="dashboard-section">
            <h2 className="section-title">Access Governance Layer</h2>
            <div className="dashboard-panel">
                <ul className="data-list">
                    <li>Role: {roleLabel}</li>
                    <li>Scope: {scopeLabel}</li>
                    <li>Consent-aware access and minimum necessary data policy enforced.</li>
                    <li>All actions are auditable and break-glass events are flagged.</li>
                    <li>Sensitive data outside current role scope remains restricted.</li>
                </ul>
            </div>
        </section>
    );
}

export default GovernancePanel;
