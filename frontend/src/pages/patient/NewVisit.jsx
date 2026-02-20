
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi'; // Ensure correct import path


const NewVisit = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hospitalCode: '',
        reason: '',
        symptoms: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await visitApi.createVisit(formData);
            setSuccess('Visit requested successfully!');
            setTimeout(() => {
                navigate('/patient/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request visit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex justify-center items-center p-5 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 transition-all">
                <h2 className="text-gray-900 dark:text-white text-center font-bold text-2xl mb-2 m-0">Request a New Visit</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm m-0">Enter the 6-digit hospital code to request a visit.</p>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-lg mb-6 text-sm flex items-center gap-2"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{error}</div>}
                {success && <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg mb-6 text-sm flex items-center gap-2"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Hospital Code</label>
                        <input
                            type="text"
                            name="hospitalCode"
                            value={formData.hospitalCode}
                            onChange={handleChange}
                            placeholder="e.g. 100001"
                            maxLength="6"
                            required
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Reason for Visit</label>
                        <input
                            type="text"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="e.g. Fever, Checkup"
                            required
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Symptoms</label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            placeholder="Describe your symptoms (optional)"
                            rows="3"
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? 'Submitting...' : 'Request Visit'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/patient/dashboard')}
                            className="w-full bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 font-semibold py-3 px-4 rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewVisit;
