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
            return visits.filter(v =>
                ['pending', 'approved', 'checked_in', 'in_progress']
                    .includes(v.status?.toLowerCase())
            );
        } else if (filter === 'past') {
            return visits.filter(v =>
                ['completed', 'cancelled']
                    .includes(v.status?.toLowerCase())
            );
        }
        return visits;
    };

    const filteredVisits = filterVisits();

    return (
        <div className="dashboard-container bg-slate-50 dark:bg-slate-900 min-h-screen">
            <header className="w-full bg-gradient-to-r from-[#3a8d9b] to-[#257582] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center bg-white/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide m-0">My Visits</h1>
                        <p className="text-white/80 text-xs mt-0.5 m-0 font-medium">Manage your appointments and check-ins</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="bg-white/20 hover:bg-white/30 transition-colors border border-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {successMessage && (
                    <div className="success-alert">
                        {successMessage}
                    </div>
                )}

                {/* Check In Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-6">
                    <div className="mb-5">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white m-0 mb-1">Schedule or Check In</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm m-0">Have a scheduled visit? Enter the code provided by your doctor or nurse to check in.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            className="bg-[#4a9fae] hover:bg-[#3a8d9b] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            onClick={() => navigate('/patient/visits/new')}
                        >
                            + Request New Visit
                        </button>
                        <button
                            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => setShowCheckIn(!showCheckIn)}
                        >
                            {showCheckIn ? 'Hide Check-In Form' : 'Check In with Code'}
                        </button>
                    </div>
                </div>

                {showCheckIn && (
                    <div className="mb-6 -mt-2">
                        <CheckInForm onCheckIn={handleCheckIn} />
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-2 mb-6 flex gap-2">
                    <button
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'past' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('past')}
                    >
                        Past Visits
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#257582] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                </div>

                {/* Visits List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="spinner mb-4 mx-auto"></div>
                            <p>Loading visits...</p>
                        </div>
                    ) : filteredVisits.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-lg m-0 mb-2">No {filter} visits found</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm m-0">
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
