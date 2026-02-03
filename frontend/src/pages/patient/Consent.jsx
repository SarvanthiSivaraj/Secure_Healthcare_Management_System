import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import ConsentForm from '../../components/consent/ConsentForm';
import ConsentCard from '../../components/consent/ConsentCard';
import { consentApi } from '../../api/consentApi';
import './Consent.css';
function Consent() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        loadConsents();
    }, []);
    const loadConsents = async () => {
        setLoading(true);
        try {
            const data = await consentApi.getActiveConsents();
            setConsents(data);
        } catch (err) {
            setError('Failed to load consents');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleGrantSuccess = () => {
        setShowForm(false);
        loadConsents();
    };
    const handleRevoke = async (consentId) => {
        if (!window.confirm('Are you sure you want to revoke this consent? The doctor will immediately lose access to your data.')) {
            return;
        }
        try {
            await consentApi.revokeConsent(consentId);
            loadConsents();
        } catch (err) {
            alert('Failed to revoke consent: ' + (err.response?.data?.message || err.message));
        }
    };
    return (
        <div className="consent-page">
            <header className="page-header">
                <div>
                    <h1>Consent Management</h1>
                    <p className="page-subtitle">Control who can access your medical data</p>
                </div>
                <Button onClick={() => navigate('/patient/dashboard')} variant="secondary">
                    Back to Dashboard
                </Button>
            </header>
            <div className="consent-content">
                {!showForm && (
                    <div className="consent-actions-bar">
                        <Button onClick={() => setShowForm(true)}>
                            + Grant New Consent
                        </Button>
                    </div>
                )}
                {showForm && (
                    <ConsentForm
                        onSuccess={handleGrantSuccess}
                        onCancel={() => setShowForm(false)}
                    />
                )}
                <div className="consents-section">
                    <h2>Active Consents</h2>

                    {loading && <p>Loading consents...</p>}

                    {error && <div className="error-alert">{error}</div>}

                    {!loading && consents.length === 0 && (
                        <div className="empty-state">
                            <p>You haven't granted any consents yet.</p>
                            <p>Click "Grant New Consent" to allow a doctor to access your medical data.</p>
                        </div>
                    )}

                    {!loading && consents.map((consent) => (
                        <ConsentCard
                            key={consent.id}
                            consent={consent}
                            onRevoke={handleRevoke}
                        />
                    ))}
                </div>
                <div className="consent-info-box">
                    <h3>🔒 Your Data, Your Control</h3>
                    <ul>
                        <li>You own your medical data</li>
                        <li>No one can access it without your explicit consent</li>
                        <li>You can revoke consent at any time</li>
                        <li>All access is logged and auditable</li>
                        <li>Emergency access requires justification and notifies you</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
export default Consent;