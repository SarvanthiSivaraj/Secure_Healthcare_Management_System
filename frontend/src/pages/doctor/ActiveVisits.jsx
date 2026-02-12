// Doctor Active Visits Page - Epic 3: Visit Management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';
import VisitCard from '../../components/visit/VisitCard';
import '../patient/Visits.css';

function ActiveVisits() {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchVisits();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchVisits, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const data = await visitApi.getActiveVisits();
            setVisits(data.data || []);
        } catch (error) {
            console.error('Failed to fetch visits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, visitId) => {
        try {
            if (action === 'view') {
                // Navigate to visit details or patient records
                console.log('View visit:', visitId);
                // TODO: Implement navigation to patient records
            } else if (action === 'close') {
                const notes = prompt('Enter closing notes (optional):');
                await visitApi.closeVisit(visitId, notes || '');
                setSuccessMessage('Visit closed successfully!');
                fetchVisits(); // Refresh visits
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="visits-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Active Visits</h1>
                    <p className="page-subtitle">Manage your current patient consultations</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/doctor/dashboard')}
                >
                    Back to Dashboard
                </button>
            </header>

            <div className="visits-content">
                {successMessage && (
                    <div className="success-alert">
                        {successMessage}
                    </div>
                )}

                {/* Refresh Button */}
                <div className="action-section">
                    <button className="btn btn-primary" onClick={fetchVisits}>
                        Refresh Visits
                    </button>
                </div>

                {/* Active Visits Count */}
                <div className="queue-stats" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="stat-card-small">
                        <div className="stat-number">{visits.length}</div>
                        <div className="stat-label">Active Consultations</div>
                    </div>
                </div>

                {/* Visits List */}
                <div className="visits-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading active visits...</p>
                        </div>
                    ) : visits.length === 0 ? (
                        <div className="empty-state">
                            <p>No active visits</p>
                            <p className="empty-hint">
                                Active patient visits will appear here for consultation
                            </p>
                        </div>
                    ) : (
                        visits.map(visit => (
                            <VisitCard
                                key={visit.id}
                                visit={visit}
                                userRole="doctor"
                                onAction={handleAction}
                                showActions={true}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ActiveVisits;
