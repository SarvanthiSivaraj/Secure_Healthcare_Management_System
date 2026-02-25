import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { nurseApi } from '../../api/nurseApi';
import './NurseDashboard.css';

function NurseDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({
        assignedPatients: 0,
        vitalsRecorded: 0,
        careTasks: 0,
        observations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await nurseApi.getDashboardStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch nurse stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="nurse-container">
            {/* Header */}
            <header className="nurse-header">
                <div className="nurse-header-inner">
                    <div className="nurse-header-left">
                        <div className="nurse-header-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                        </div>
                        <div className="nurse-header-text">
                            <h1>Nurse Portal</h1>
                            <p>Patient Care & Vitals Management</p>
                        </div>
                    </div>

                    <div className="nurse-header-right">
                        <button
                            className="nurse-header-btn profile-btn"
                            onClick={() => navigate('/profile')}
                            title="View Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </button>
                        <button className="nurse-header-btn signout-btn" onClick={handleLogout}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="nurse-content">
                {/* Info Card */}
                <div className="nurse-info-card">
                    <div className="nurse-user-info">
                        <h2>Welcome, {user?.firstName || 'Nurse'} {user?.lastName || ''}</h2>
                        <p>License: {user?.licenseNumber || 'RN-2024-56789'}</p>
                    </div>
                    <div className="nurse-status-badge">
                        <span className="status-dot"></span>
                        On Duty
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="nurse-stats-grid">
                    <div className="nurse-stat-box">
                        <div className="nurse-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        </div>
                        <div className="nurse-stat-value">{loading ? '...' : stats.assignedPatients}</div>
                        <div className="nurse-stat-label">Assigned Patients</div>
                    </div>

                    <div className="nurse-stat-box">
                        <div className="nurse-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        </div>
                        <div className="nurse-stat-value">{loading ? '...' : stats.vitalsRecorded}</div>
                        <div className="nurse-stat-label">Vitals Recorded</div>
                    </div>

                    <div className="nurse-stat-box">
                        <div className="nurse-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div className="nurse-stat-value">{loading ? '...' : stats.careTasks}</div>
                        <div className="nurse-stat-label">Care Tasks</div>
                    </div>

                    <div className="nurse-stat-box">
                        <div className="nurse-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <div className="nurse-stat-value">{loading ? '...' : stats.observations}</div>
                        <div className="nurse-stat-label">Observations</div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="nurse-section-header">
                    <h3>Care Services</h3>
                </div>

                <div className="nurse-services-grid">
                    <div className="nurse-service-card" onClick={() => navigate('/nurse/vitals')}>
                        <div className="nurse-service-main">
                            <div className="nurse-service-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <div className="nurse-service-info">
                                <h4>Record Vitals</h4>
                                <p>Record patient vital signs and physical measurements</p>
                            </div>
                        </div>
                        <div className="nurse-service-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>

                    <div className="nurse-service-card" onClick={() => navigate('/nurse/patients')}>
                        <div className="nurse-service-main">
                            <div className="nurse-service-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                            </div>
                            <div className="nurse-service-info">
                                <h4>Assigned Patients</h4>
                                <p>View and manage your assigned patient list</p>
                            </div>
                        </div>
                        <div className="nurse-service-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>

                    <div className="nurse-service-card" onClick={() => navigate('/nurse/notes')}>
                        <div className="nurse-service-main">
                            <div className="nurse-service-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </div>
                            <div className="nurse-service-info">
                                <h4>Care Observations</h4>
                                <p>Document patient care observations and notes</p>
                            </div>
                        </div>
                        <div className="nurse-service-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>

                    <div className="nurse-service-card" onClick={() => navigate('/nurse/medications')}>
                        <div className="nurse-service-main">
                            <div className="nurse-service-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
                            </div>
                            <div className="nurse-service-info">
                                <h4>Medication Admin</h4>
                                <p>Track and document medication administration</p>
                            </div>
                        </div>
                        <div className="nurse-service-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default NurseDashboard;
