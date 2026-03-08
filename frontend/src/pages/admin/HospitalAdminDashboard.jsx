import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import apiClient from '../../api/client';
import '../patient/Dashboard.css';

// ─── Shared Admin Sidebar ─────────────────────────────────────────────────────
export function AdminSidebar({ active }) {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const links = [
        { to: '/admin/dashboard', icon: 'grid_view', label: 'Overview' },
        { to: '/admin/staff', icon: 'manage_accounts', label: 'Staff Management' },
        { to: '/admin/doctor-verification', icon: 'verified_user', label: 'Doctor Verification' },
        { to: '/admin/users', icon: 'group', label: 'User Management' },
        { to: '/admin/audit-logs', icon: 'receipt_long', label: 'Audit Logs' },
    ];

    return (
        <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800/50 p-6 flex flex-col h-full overflow-y-auto z-20">
            <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/admin/dashboard')}>
                <div className="relative">
                    <div className="absolute inset-0 bg-violet-500 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
                    <div className="relative w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                        <span className="material-symbols-outlined text-xl">local_hospital</span>
                    </div>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Medicare</h1>
            </div>

            <nav className="space-y-1 flex-grow">
                {links.map(link => {
                    const isActive = active === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'sidebar-item-active text-slate-800 dark:text-slate-800 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50">
                <button onClick={logout} className="w-full flex items-center justify-start gap-3 px-4 py-3 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition rounded-xl font-medium text-sm">
                    <span className="material-symbols-outlined text-[20px]">logout</span>Sign Out
                </button>
            </div>
        </aside>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
function HospitalAdminDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalStaff: 0, activeDoctors: 0, pendingVisits: 0, totalPatients: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/v1/admin/hospital/stats');
                const data = response.data;
                if (data.success) setStats(data.data);
            } catch (err) {
                console.error('Failed to fetch hospital stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const navCards = [
        { path: '/admin/staff', icon: 'manage_accounts', color: 'indigo', title: 'Staff Management', desc: 'Invite staff members and manage invitations' },
        { path: '/admin/doctor-verification', icon: 'verified_user', color: 'teal', title: 'Doctor Verification', desc: 'Review and approve doctor registrations' },
        { path: '/admin/users', icon: 'group', color: 'violet', title: 'User Management', desc: 'Manage accounts, roles and access permissions' },
        { path: '/admin/audit-logs', icon: 'receipt_long', color: 'rose', title: 'Audit Logs', desc: 'Review system activity and security trails' },
    ];

    const statCards = [
        { label: 'Total Staff', value: stats.totalStaff, icon: 'manage_accounts', color: 'indigo' },
        { label: 'Active Doctors', value: stats.activeDoctors, icon: 'stethoscope', color: 'teal' },
        { label: 'Pending Visits', value: stats.pendingVisits, icon: 'pending_actions', color: 'amber', onClick: () => navigate('/admin/visits', { state: { activeTab: 'pending' } }) },
        { label: 'Total Patients', value: stats.totalPatients, icon: 'favorite', color: 'rose' },
    ];

    return (
        <div className="patient-dashboard-wrapper bg-[var(--background-light)] dark:bg-[var(--background-dark)] text-slate-800 dark:text-slate-100 flex h-screen w-full overflow-hidden">
            <div className="absolute top-4 right-4 z-50"><ThemeToggle /></div>

            <AdminSidebar active="/admin/dashboard" />

            <main className="flex-grow p-4 md:p-8 overflow-y-auto h-full relative">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Hospital Admin Portal</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Hospital Administration &amp; Staff Management</p>
                        </div>
                        <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl">
                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Administrator · Full Access</p>
                            </div>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                                <span className="material-symbols-outlined text-2xl">manage_accounts</span>
                            </div>
                            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{statsLoading ? '—' : stats.totalStaff}</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Total Staff</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                                <span className="material-symbols-outlined text-2xl">stethoscope</span>
                            </div>
                            <p className="text-4xl font-black text-teal-600 dark:text-teal-400">{statsLoading ? '—' : stats.activeDoctors}</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Active Doctors</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" onClick={() => navigate('/admin/visits', { state: { activeTab: 'pending' } })}>
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                                <span className="material-symbols-outlined text-2xl">pending_actions</span>
                            </div>
                            <p className="text-4xl font-black text-amber-600 dark:text-amber-400">{statsLoading ? '—' : stats.pendingVisits}</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Pending Visits</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                                <span className="material-symbols-outlined text-2xl">favorite</span>
                            </div>
                            <p className="text-4xl font-black text-rose-600 dark:text-rose-400">{statsLoading ? '—' : stats.totalPatients}</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Total Patients</p>
                        </div>
                    </div>
                </header>

                {/* Nav Cards */}
                <div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-violet-500 rounded-full inline-block" />
                        Hospital Administration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {navCards.map(card => (
                            <div key={card.path} onClick={() => navigate(card.path)} className="glass-card p-6 rounded-3xl cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group flex items-center justify-between border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/30 flex items-center justify-center text-${card.color}-600 dark:text-${card.color}-400 flex-shrink-0`}>
                                        <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{card.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition-colors flex-shrink-0 ml-4">arrow_forward</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HospitalAdminDashboard;
