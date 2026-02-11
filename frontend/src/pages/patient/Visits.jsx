// Patient Visits Page - Epic 3: Visit Management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';
import VisitCard from '../../components/visit/VisitCard';
import CheckInForm from '../../components/visit/CheckInForm';
import '../patient/Dashboard.css'; // Shared dashboard theme
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
            setVisits(data || []);  // getMyVisits returns array directly
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
        if (filter === 'upcoming') {
            // Backend statuses: pending, approved, in_progress
            return visits.filter(v =>
                v.status === 'pending' ||
                v.status === 'approved' ||
                v.status === 'in_progress'
            );
        } else if (filter === 'past') {
            // Backend statuses: completed, cancelled
            return visits.filter(v =>
                v.status === 'completed' ||
                v.status === 'cancelled'
            );
        }
        return visits;
    };

    const filteredVisits = filterVisits();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>My Visits</h1>
                        <p className="header-subtitle">Manage your appointments and check-ins</p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/patient/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                {successMessage && (
                    <div className="success-alert">
                        {successMessage}
                    </div>
                )}

                {/* Check In Section */}
                <div className="action-section">
                    <div className="checkin-info">
                        <p>Have a scheduled visit? Enter the code provided by your doctor or nurse to check in.</p>
                    </div>
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/patient/visits/new')}
                        >
                            + Request New Visit
                        </button>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => setShowCheckIn(!showCheckIn)}
                        >
                            {showCheckIn ? 'Hide Check-In Form' : 'Check In with Code'}
                        </button>
                    </div>
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
