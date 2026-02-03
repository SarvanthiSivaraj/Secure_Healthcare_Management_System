// Patient Visits Page - Epic 3: Visit Management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';
import VisitCard from '../../components/visit/VisitCard';
import CheckInForm from '../../components/visit/CheckInForm';
import './Visits.css';

function Visits() {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchVisits();
    }, [filter]);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const data = await visitApi.getMyVisits();
            setVisits(data.visits || []);
        } catch (error) {
            console.error('Failed to fetch visits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (visitCode) => {
        try {
            await visitApi.checkIn(visitCode);
            setSuccessMessage('Successfully checked in! Your visit has been registered.');
            setShowCheckIn(false);
            fetchVisits(); // Refresh visits

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            throw error; // Let CheckInForm handle the error
        }
    };

    const filterVisits = () => {
        const now = new Date();
        if (filter === 'upcoming') {
            return visits.filter(v =>
                new Date(v.scheduledTime) >= now ||
                v.status === 'SCHEDULED' ||
                v.status === 'CHECKED_IN' ||
                v.status === 'ACTIVE'
            );
        } else if (filter === 'past') {
            return visits.filter(v => v.status === 'COMPLETED');
        }
        return visits;
    };

    const filteredVisits = filterVisits();

    return (
        <div className="visits-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>My Visits</h1>
                    <p className="page-subtitle">Manage your appointments and check-ins</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/patient/dashboard')}
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

                {/* Check In Button */}
                <div className="action-section">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setShowCheckIn(!showCheckIn)}
                    >
                        {showCheckIn ? 'Hide Check-In Form' : '+ Check In for Visit'}
                    </button>
                </div>

                {showCheckIn && (
                    <div className="checkin-section">
                        <CheckInForm onCheckIn={handleCheckIn} />
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past Visits
                    </button>
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                </div>

                {/* Visits List */}
                <div className="visits-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading visits...</p>
                        </div>
                    ) : filteredVisits.length === 0 ? (
                        <div className="empty-state">
                            <p>No {filter} visits found</p>
                            <p className="empty-hint">
                                {filter === 'upcoming'
                                    ? 'Schedule an appointment to see it here'
                                    : 'Your visit history will appear here'}
                            </p>
                        </div>
                    ) : (
                        filteredVisits.map(visit => (
                            <VisitCard
                                key={visit.id}
                                visit={visit}
                                userRole="patient"
                                showActions={false}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Visits;
