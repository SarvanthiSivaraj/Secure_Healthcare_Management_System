// Patient Visits Page - Epic 3: Visit Management
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { visitApi } from '../../api/visitApi';
import VisitCard from '../../components/visit/VisitCard';
import CheckInForm from '../../components/visit/CheckInForm';
import '../patient/Dashboard.css'; // Shared dashboard theme
import './Visits.css';

function Visits() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
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
        <div className="patient-dashboard-wrapper bg-[var(--background-light)] dark:bg-[var(--background-dark)] text-slate-800 dark:text-slate-100 flex h-screen w-full overflow-hidden">
            {/* Theme Toggle styling */}
            <div className="absolute top-4 right-4 z-50">
                <button onClick={() => document.documentElement.classList.toggle('dark')} className="glass-card p-3 rounded-full hover:bg-white/40 dark:hover:bg-slate-700/50 transition flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-500 !block dark:!hidden">dark_mode</span>
                    <span className="material-symbols-outlined text-amber-500 !hidden dark:!block">light_mode</span>
                </button>
            </div>

            <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800/50 p-6 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/patient/dashboard')}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            <span className="material-symbols-outlined text-xl transition-transform duration-500 group-hover:scale-110">local_hospital</span>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-all duration-500 drop-shadow-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">Medicare</h1>
                </div>
                <nav className="space-y-2 flex-grow">
                    <button onClick={() => navigate('/patient/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition rounded-xl">
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 sidebar-item-active rounded-xl font-medium text-slate-800 dark:text-slate-800">
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        Appointments
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition rounded-xl">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                        Messages
                    </button>
                    <button onClick={() => navigate('/patient/medical-records')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition rounded-xl">
                        <span className="material-symbols-outlined text-[20px]">folder_shared</span>
                        Records
                    </button>
                    <button onClick={() => navigate('/patient/consent')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition rounded-xl">
                        <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        Consents
                    </button>
                </nav>
                <div className="space-y-2 mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50">
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition rounded-xl">
                        <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                        Support
                    </Link>
                    <Link to="/patient/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition rounded-xl">
                        <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                        Profile
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition rounded-xl font-medium">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8 overflow-y-auto">
                <header className="mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">My Visits</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your appointments and check-ins</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap flex items-center gap-2"
                                onClick={() => navigate('/patient/visits/new')}
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Request Visit
                            </button>
                        </div>
                    </div>
                </header>

                {successMessage && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl mb-8 flex items-center gap-3 border border-emerald-100 dark:border-emerald-500/10">
                        <span className="material-symbols-outlined">check_circle</span>
                        {successMessage}
                    </div>
                )}

                {/* Quick Actions / Check In */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Filter Tabs */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 bg-white/40 dark:bg-slate-800/40 p-1.5 rounded-2xl inline-flex backdrop-blur-sm border border-white/50 dark:border-slate-700/50">
                                <button
                                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${filter === 'upcoming' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    onClick={() => setFilter('upcoming')}
                                >
                                    Upcoming
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'upcoming' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        {visits.filter(v => ['pending', 'approved', 'checked_in', 'in_progress'].includes(v.status?.toLowerCase())).length}
                                    </span>
                                </button>
                                <button
                                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${filter === 'past' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    onClick={() => setFilter('past')}
                                >
                                    Past
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'past' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        {visits.filter(v => ['completed', 'cancelled'].includes(v.status?.toLowerCase())).length}
                                    </span>
                                </button>
                                <button
                                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'all' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        {visits.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Visits List */}
                        <div className="space-y-4 min-h-[400px]">
                            {loading ? (
                                <div className="glass-card rounded-3xl p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 animate-spin mb-4">refresh</span>
                                    <p className="text-slate-500 font-medium">Loading visits...</p>
                                </div>
                            ) : filteredVisits.length === 0 ? (
                                <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center border-dashed border-2 border-slate-200 dark:border-slate-700/50 bg-transparent">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
                                        <span className="material-symbols-outlined text-3xl">event_busy</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-wide">No {filter} visits</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
                                        {filter === 'upcoming'
                                            ? 'You don\'t have any active appointments. Check the "Past" tab or request a new visit.'
                                            : 'Your visit history is currently empty.'}
                                    </p>
                                    {filter === 'upcoming' && (
                                        <button
                                            onClick={() => navigate('/patient/visits/new')}
                                            className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase hover:underline"
                                        >
                                            Request Your First Visit →
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredVisits.map(visit => (
                                    <div key={visit.id} className="transform transition-all duration-300 hover:-translate-y-1">
                                        <VisitCard
                                            visit={visit}
                                            userRole="patient"
                                            showActions={false}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-indigo-100/50 dark:border-slate-700/50 bg-indigo-50/10 dark:bg-slate-800/20">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500 text-lg">qr_code_scanner</span>
                                Quick Check-In
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
                                Arrived at the hospital? Enter your 6-digit visit code to let the staff know you're here.
                            </p>
                            <button
                                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${showCheckIn ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/40'}`}
                                onClick={() => setShowCheckIn(!showCheckIn)}
                            >
                                {showCheckIn ? 'Cancel Check-In' : 'Open Check-In Form'}
                            </button>

                            {showCheckIn && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <CheckInForm onCheckIn={handleCheckIn} />
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/30">
                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Appointment Help</h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-indigo-500 text-sm">schedule</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                                        Please arrive 15 minutes before your scheduled appointment time.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-indigo-500 text-sm">notifications_active</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                                        You'll receive an SMS notification when the doctor is ready to see you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Visits;
