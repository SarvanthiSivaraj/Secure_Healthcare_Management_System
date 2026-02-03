// Doctor Dashboard - Similar to Patient Dashboard but for doctors
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import '../patient/Dashboard.css';

function DoctorDashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Doctor Dashboard</h1>
                <Button onClick={logout} variant="secondary">Logout</Button>
            </header>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>Welcome, Dr. {user?.firstName || 'Doctor'}!</h2>
                    <p>Professional ID: {user?.professionalId || 'DOC-XXXXXXXX'}</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Active Visits</h3>
                        <p>Manage patient visits</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Consultations</h3>
                        <p>Create and view consultations</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Emergency Access</h3>
                        <p>Break-glass access mode</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>My Schedule</h3>
                        <p>View appointments</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;
