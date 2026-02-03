import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './Dashboard.css';

function PatientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Patient Dashboard</h1>
                <Button onClick={logout} variant="secondary">Logout</Button>
            </header>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>Welcome, {user?.firstName || 'Patient'}!</h2>
                    <p>Your Unique Health ID: {user?.uniqueHealthId || 'UHI-XXXXXXXX'}</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card" onClick={() => navigate('/patient/consent')}>
                        <h3>My Consents</h3>
                        <p>Manage who can access your medical data</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Medical Records</h3>
                        <p>View your consultation history</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Visits</h3>
                        <p>Check-in for appointments</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Audit Logs</h3>
                        <p>See who accessed your data</p>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default PatientDashboard;