import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import ConsentForm from '../../components/consent/ConsentForm';
import ConsentCard from '../../components/consent/ConsentCard';
import { consentApi } from '../../api/consentApi';
import '../patient/Dashboard.css'; // Shared dashboard theme
import './Consent.css';

function Consent() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'
    const [showForm, setShowForm] = useState(false);
    const [editingConsent, setEditingConsent] = useState(null);
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (viewMode === 'active') {
            loadConsents();
        } else {
            loadHistory();
        }
    }, [viewMode]);

    const loadConsents = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await consentApi.getActiveConsents();
            setConsents(data || []);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status !== 404) {
                setError('Failed to load active consents');
            } else {
                setConsents([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        setLoading(true);
        setError('');
        try {
            // Check if getConsentHistory exists before calling
            if (typeof consentApi.getConsentHistory !== 'function') {
                throw new Error('History API not implemented yet');
            }
            const data = await consentApi.getConsentHistory();
            setConsents(data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load consent history');
            setConsents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGrantSuccess = useCallback(() => {
        setShowForm(false);
        setEditingConsent(null);
        // Switch to active view to see new consent
        if (viewMode !== 'active') {
            setViewMode('active');
        } else {
            loadConsents();
        }
    }, [viewMode]);

    const handleEdit = useCallback((consent) => {
        setEditingConsent(consent);
        setShowForm(true);
    }, []);

    const handleRevoke = useCallback(async (consentId) => {
        try {
            await consentApi.revokeConsent(consentId);
            // Refresh current view
            if (viewMode === 'active') {
                loadConsents();
            } else {
                loadHistory();
            }
        } catch (err) {
            alert('Failed to revoke consent: ' + (err.response?.data?.message || err.message));
        }
    }, [viewMode]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Consent Management</h1>
                        <p className="header-subtitle">Control who can access your medical data</p>
                    </div>
                    <Button onClick={() => navigate('/patient/dashboard')} variant="secondary">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
                {!showForm && (
                    <div className="consent-controls">
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'active' ? 'active' : ''}`}
                                onClick={() => setViewMode('active')}
                            >
                                Active Consents
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'history' ? 'active' : ''}`}
                                onClick={() => setViewMode('history')}
                            >
                                Past Accesses
                            </button>
                        </div>
                        <Button onClick={() => { setEditingConsent(null); setShowForm(true); }}>
                            + Grant New Consent
                        </Button>
                    </div>
                )}

                {showForm && (
                    <ConsentForm
                        initialData={editingConsent}
                        onSuccess={handleGrantSuccess}
                        onCancel={() => { setShowForm(false); setEditingConsent(null); }}
                    />
                )}

                <div className="consents-section">
                    <h2>{viewMode === 'active' ? 'Active Consents' : 'Access History'}</h2>

                    {loading && <p>Loading...</p>}

                    {error && <div className="error-alert">{error}</div>}

                    {!loading && consents.length === 0 && (
                        <div className="empty-state">
                            {viewMode === 'active' ? (
                                <>
                                    <p>You haven't granted any consents yet.</p>
                                    <p>Click "Grant New Consent" to allow a doctor to access your medical data.</p>
                                </>
                            ) : (
                                <p>No past consent history found.</p>
                            )}
                        </div>
                    )}

                    {!loading && consents.map((consent) => (
                        <ConsentCard
                            key={consent.id}
                            consent={consent}
                            onRevoke={handleRevoke}
                            onEdit={handleEdit}
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