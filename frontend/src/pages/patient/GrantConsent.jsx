import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { consentApi } from '../../api/consentApi';
import ParticleBackground from '../../components/common/ParticleBackground';

const ACCESS_LEVELS = ['none', 'read', 'write', 'read & write'];

const ACCESS_STYLES = {
    'none': { active: 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white', label: 'None' },
    'read': { active: 'bg-indigo-500 text-white', label: 'Read' },
    'write': { active: 'bg-amber-500 text-white', label: 'Write' },
    'read & write': { active: 'bg-teal-500 text-white', label: 'Read & Write' },
};

function GrantConsent() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialHospitalName = searchParams.get('hospitalName') || 'Unknown Hospital';
    const initialDurationStr = searchParams.get('duration') || '2';
    const initialHospitalId = searchParams.get('hospitalId') || 'hosp-123';
    const recordsRequestedStr = searchParams.get('recordsRequested') || 'Consultation,Lab Results';
    const initialRecords = recordsRequestedStr.split(',').map(r => r.trim());

    const [hospitalName] = useState(initialHospitalName);
    const [hospitalId] = useState(initialHospitalId);
    const [durationHours, setDurationHours] = useState(parseInt(initialDurationStr) || 2);
    const [durationMinutes, setDurationMinutes] = useState(0);

    const recordTypes = ['Consultation', 'Diagnosis', 'Prescription', 'Lab Results', 'Medical Imaging'];

    const [permissions, setPermissions] = useState(() => {
        const perms = {};
        recordTypes.forEach(rt => {
            perms[rt] = initialRecords.includes(rt) ? 'read' : 'none';
        });
        return perms;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePermissionChange = (recordType, level) => {
        setPermissions(prev => ({ ...prev, [recordType]: level }));
    };

    const handleGrant = async () => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                hospitalId,
                hospitalName,
                durationHours,
                durationMinutes,
                // Also calculate a fallback endTime just in case the backend path expects it
                endTime: new Date(Date.now() + (durationHours * 3600 + durationMinutes * 60) * 1000).toISOString(),
                permissions: Object.entries(permissions)
                    .filter(([, v]) => v !== 'none')
                    .map(([k, v]) => ({ recordType: k, accessLevel: v }))
            };
            await consentApi.grantConsent(payload);
            navigate('/patient/consent');
        } catch (err) {
            setError('Failed to grant consent. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-dashboard-wrapper bg-[var(--background-light)] dark:bg-[var(--background-dark)] min-h-screen transition-colors duration-300 relative overflow-x-hidden overflow-y-auto">
            {/* Dynamic particle background */}
            <ParticleBackground />

            {/* Theme toggle */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={() => document.documentElement.classList.toggle('dark')}
                    className="glass-card p-3 rounded-full hover:bg-white/40 dark:hover:bg-slate-700/50 transition flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-indigo-500 !block dark:!hidden">dark_mode</span>
                    <span className="material-symbols-outlined text-amber-500 !hidden dark:!block">light_mode</span>
                </button>
            </div>

            <div className="relative z-10 flex items-start justify-center min-h-screen py-10 px-4 text-slate-800 dark:text-slate-100">
                <div className="w-full max-w-2xl glass-card rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-2xl mt-4">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-indigo-500 text-3xl">health_and_safety</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Grant Data Access</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and customize the access levels before granting.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border border-rose-200 dark:border-rose-900/50">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Hospital Info */}
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-xl">local_hospital</span>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Requesting Hospital</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{hospitalName}</div>
                            </div>
                        </div>

                        {/* Record Permissions */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Record Access Levels</label>
                            <div className="space-y-3">
                                {recordTypes.map(rt => {
                                    const level = permissions[rt];
                                    const isRequested = initialRecords.includes(rt);
                                    return (
                                        <div key={rt} className={`p-4 rounded-2xl border transition-colors ${isRequested ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30'}`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{rt}</span>
                                                    {isRequested && (
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Requested by Hospital</span>
                                                    )}
                                                </div>
                                                {/* Segmented control */}
                                                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl gap-0.5">
                                                    {ACCESS_LEVELS.map(lvl => (
                                                        <button
                                                            key={lvl}
                                                            onClick={() => handlePermissionChange(rt, lvl)}
                                                            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${level === lvl ? ACCESS_STYLES[lvl].active + ' shadow-sm scale-[1.03]' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                                                        >
                                                            {ACCESS_STYLES[lvl].label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Duration of Access</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Hours</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={durationHours}
                                        onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="text-slate-400 mt-5 font-bold">:</div>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Minutes</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-4">
                            <button
                                onClick={() => navigate('/patient/dashboard')}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGrant}
                                disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                        Granting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Grant Access
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GrantConsent;
