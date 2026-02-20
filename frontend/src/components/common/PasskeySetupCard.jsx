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
            } else if (err.response?.status === 401) {
                setMessage('Passkey setup needs a real backend login session. Dev Login tokens cannot register passkeys.');
            } else {
                setMessage(err.response?.data?.message || err.message || 'Failed to set up passkey');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 w-full transition-all">
            {/* Toggle Button */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-semibold text-[#4a9fae] dark:text-[#3a8d9b] py-1 w-full hover:text-[#257582] dark:hover:text-teal-300 transition-colors focus:outline-none"
            >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Set Up Passkey
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    className={`ml-auto transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="py-2">
                    <p className="m-0 mb-3 text-sm text-gray-500 dark:text-gray-400">
                        Use fingerprint, face, PIN, or security key to sign in without a password.
                    </p>

                    {/* Auth method icons row */}
                    <div className="flex gap-4 mb-4">
                        {[
                            { icon: '👆', label: 'Fingerprint' },
                            { icon: '😊', label: 'Face' },
                            { icon: '🔢', label: 'PIN' },
                            { icon: '🔑', label: 'Key' },
                        ].map(m => (
                            <div key={m.label} className="text-xs text-gray-500 dark:text-gray-400 text-center flex flex-col items-center gap-1">
                                <span className="text-xl bg-gray-50 dark:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 dark:border-slate-600">{m.icon}</span>
                                <span>{m.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Status */}
                    {status === 'success' && (
                        <div className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm mb-3">
                            ✅ {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-3">
                            ⚠️ {message}
                        </div>
                    )}

                    {/* Register button */}
                    {status !== 'success' && (
                        <button
                            onClick={handleSetupPasskey}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent bg-[#4a9fae] hover:bg-[#257582] text-white text-sm font-semibold cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Setting up...
                                </>
                            ) : '+ Register Passkey'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PasskeySetupCard;
