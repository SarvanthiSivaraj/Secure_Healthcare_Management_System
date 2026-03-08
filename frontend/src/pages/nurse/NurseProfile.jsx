import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { nurseApi } from '../../api/nurseApi';
import ThemeToggle from '../../components/common/ThemeToggle';
import '../../pages/patient/Dashboard.css';

const NurseProfile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable local state
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        address: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await nurseApi.getProfile();
            if (response && response.success) {
                const data = response.data;
                setProfile(data);
                setFormData({
                    phone: data.phone || '',
                    address: data.address || ''
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                phone: formData.phone,
                address: formData.address
            };
            const response = await nurseApi.updateProfile(payload);

            if (response && response.success) {
                setProfile(response.data);
                setEditMode(false);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation configuration
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', path: '/nurse/dashboard' },
        { id: 'patients', label: 'Assigned Patients', icon: 'group', path: '/nurse/patients' },
        { id: 'vitals', label: 'Vitals & Notes', icon: 'monitor_heart', path: '/nurse/vitals' },
        { id: 'medications', label: 'Medications', icon: 'medication', path: '/nurse/medications' },
        { id: 'schedule', label: 'Shift Schedule', icon: 'calendar_month', path: '/nurse/schedule' },
    ];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="patient-dashboard-wrapper bg-[var(--background-light)] dark:bg-[var(--background-dark)] text-slate-800 dark:text-slate-100 flex h-screen w-full overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Left Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800/50 p-6 flex flex-col h-full overflow-y-auto z-20 bg-[var(--background-light)] dark:bg-[var(--background-dark)] relative">
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/nurse/dashboard')}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-500 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                            <span className="material-symbols-outlined text-xl transition-transform duration-500 group-hover:scale-110">medical_services</span>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-all duration-500 drop-shadow-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:drop-shadow-[0_0_10px_rgba(20,184,166,0.4)]">Medicare</h1>
                </div>

                <nav className="space-y-2 flex-grow">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || location.pathname.includes(item.path);

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive
                                    ? 'bg-teal-50/80 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${isActive ? '' : ''}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="space-y-2 mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50">
                    <Link to="/nurse/profile" className="flex items-center gap-3 px-4 py-3 bg-teal-50/80 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50 shadow-sm rounded-xl font-medium">
                        <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition rounded-xl font-medium"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                <header className="px-8 py-6 flex items-center justify-between flex-shrink-0 z-10 sticky top-0 bg-[var(--background-light)]/80 dark:bg-[var(--background-dark)]/80 backdrop-blur-md border-b border-transparent transition-all">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">My Profile</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your employment details and contact information</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-4 pb-20 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {successMessage && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 animate-fade-in-up">
                                <span className="material-symbols-outlined">check_circle</span>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Identity Card */}
                            <div className="md:col-span-1 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center text-3xl font-bold mb-4 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                                    {profile.profilePhoto ? (
                                        <img
                                            src={profile.profilePhoto}
                                            alt={`${profile.firstName} ${profile.lastName}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = ''; // Clear src to show fallback
                                                e.target.style.display = 'none';
                                                // We can't easily trigger the initials from here without state change
                                            }}
                                        />
                                    ) : (
                                        <span>{profile.firstName.charAt(0)}{profile.lastName.charAt(0)}</span>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{profile.firstName} {profile.lastName}</h2>
                                <p className="text-teal-600 dark:text-teal-400 font-medium text-sm mb-4">{profile.role}</p>

                                <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Employee ID</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.employeeId}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Status</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">{profile.status}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Department</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.department}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Information */}
                            <div className="md:col-span-2 space-y-6">

                                {/* Form / Display */}
                                <div className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-teal-500">contact_mail</span>
                                            Contact Information
                                        </h3>
                                        <button
                                            onClick={() => {
                                                if (editMode) {
                                                    // Reset form data on cancel
                                                    setFormData({
                                                        phone: profile.phone || '',
                                                        address: profile.address || ''
                                                    });
                                                }
                                                setEditMode(!editMode);
                                            }}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold transition bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                        >
                                            {editMode ? 'Cancel' : 'Edit Details'}
                                        </button>
                                    </div>

                                    {editMode ? (
                                        <form onSubmit={handleSave} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</label>
                                                    <input
                                                        type="text" name="phone" value={formData.phone} onChange={handleInputChange} required
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 transition"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Home Address</label>
                                                    <textarea
                                                        name="address" value={formData.address} onChange={handleInputChange} required rows={2}
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 transition resize-none"
                                                    />
                                                </div>

                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <button
                                                    type="submit" disabled={saving}
                                                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {saving ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                                    )}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                                                    <p className="text-slate-800 dark:text-slate-200 font-medium">{profile.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                                                    <p className="text-slate-800 dark:text-slate-200 font-medium">{profile.phone}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Home Address</p>
                                                    <p className="text-slate-800 dark:text-slate-200 font-medium">{profile.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Credentials */}
                            <div className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">verified</span>
                                    Professional Credentials
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">License Number</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-semibold font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{profile.licenseNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Joined Date</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{new Date(profile.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <span className="material-symbols-outlined text-rose-500">contact_emergency</span>
                                    Emergency Contact
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Name</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{profile.emergencyContact?.name || 'Not Provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Relationship</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{profile.emergencyContact?.relationship || 'Not Provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{profile.emergencyContact?.phone || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shift & Wards */}
                            <div className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <span className="material-symbols-outlined text-9xl">business</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                                    <span className="material-symbols-outlined text-amber-500">assignment</span>
                                    Assignments & Schedule
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Assigned Wards</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.assignedWards?.map((ward, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-800/50">
                                                    {ward}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Shift Preference</p>
                                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                                            <span className="material-symbols-outlined text-amber-500">light_mode</span>
                                            {profile.shiftPreference}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NurseProfile;
