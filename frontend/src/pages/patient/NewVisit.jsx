
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi'; // Ensure correct import path
import './NewVisit.css'; // We'll create this css next

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
        <div className="new-visit-container">
            <div className="new-visit-card">
                <h2>Join a Hospital</h2>
                <p>Enter the 6-digit hospital code to request a visit.</p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Hospital Code</label>
                        <input
                            type="text"
                            name="hospitalCode"
                            value={formData.hospitalCode}
                            onChange={handleChange}
                            placeholder="e.g. 100001"
                            maxLength="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Reason for Visit</label>
                        <input
                            type="text"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="e.g. Fever, Checkup"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Symptoms</label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            placeholder="Describe your symptoms (optional)"
                            rows="3"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Request Visit'}
                    </button>

                    <button type="button" className="cancel-btn" onClick={() => navigate('/patient/dashboard')}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewVisit;
