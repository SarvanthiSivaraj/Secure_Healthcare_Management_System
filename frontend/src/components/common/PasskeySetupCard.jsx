import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { startRegistration } from '@simplewebauthn/browser';

/**
 * PasskeySetupCard - Inline collapsible passkey registration, designed to sit inside a user info bar.
 * Hidden by default, revealed by a toggle button.
 */
function PasskeySetupCard() {
    const { user } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');

    if (!user) return null;

    const handleSetupPasskey = async () => {
        setLoading(true);
        setStatus(null);
        setMessage('');

        try {
            const optionsRes = await authApi.passkeyRegisterOptions();
            if (!optionsRes.success) throw new Error(optionsRes.message || 'Failed to get passkey options');

            const credential = await startRegistration({ optionsJSON: optionsRes.data });

            const verifyRes = await authApi.passkeyRegisterVerify(credential, 'My Passkey');
            if (!verifyRes.success) throw new Error(verifyRes.message || 'Passkey registration failed');

            setStatus('success');
            setMessage('Passkey registered! You can now sign in with your fingerprint, face, or PIN.');
        } catch (err) {
            setStatus('error');
            if (err.name === 'NotAllowedError') {
                setMessage('Passkey setup was cancelled.');
            } else {
                setMessage(err.response?.data?.message || err.message || 'Failed to set up passkey');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: '12px', paddingTop: '8px' }}>
            {/* Toggle Button */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#4f6bed',
                    padding: '4px 0',
                    width: '100%',
                }}
            >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Set Up Passkey
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 'auto' }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable content */}
            <div style={{
                maxHeight: expanded ? '300px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease, opacity 0.3s ease',
                opacity: expanded ? 1 : 0,
            }}>
                <div style={{ padding: '10px 0 4px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                        Use fingerprint, face, PIN, or security key to sign in without a password.
                    </p>

                    {/* Auth method icons row */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        {[
                            { icon: '👆', label: 'Fingerprint' },
                            { icon: '😊', label: 'Face' },
                            { icon: '🔢', label: 'PIN' },
                            { icon: '🔑', label: 'Key' },
                        ].map(m => (
                            <span key={m.label} style={{ fontSize: '11px', color: '#475569', textAlign: 'center' }}>
                                <span style={{ fontSize: '16px', display: 'block' }}>{m.icon}</span>
                                {m.label}
                            </span>
                        ))}
                    </div>

                    {/* Status */}
                    {status === 'success' && (
                        <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '12px', marginBottom: '8px' }}>
                            ✅ {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '12px', marginBottom: '8px' }}>
                            ⚠️ {message}
                        </div>
                    )}

                    {/* Register button */}
                    {status !== 'success' && (
                        <button
                            onClick={handleSetupPasskey}
                            disabled={loading}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #4f6bed, #3b5de5)',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Setting up...' : '+ Register Passkey'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PasskeySetupCard;
