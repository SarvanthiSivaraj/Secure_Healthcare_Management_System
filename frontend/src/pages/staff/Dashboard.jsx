// Staff Dashboard (Nurse, Lab Tech, Radiologist, Pharmacist)
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import '../patient/Dashboard.css';

function StaffDashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Staff Dashboard</h1>
                <Button onClick={logout} variant="secondary">Logout</Button>
            </header>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>Welcome, {user?.firstName || 'Staff'}!</h2>
                    <p>Role: {user?.staffRole || 'Staff Member'}</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Assigned Tasks</h3>
                        <p>View your assigned work</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Active Visits</h3>
                        <p>Visits you're assigned to</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>My Shift</h3>
                        <p>Current shift information</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Notifications</h3>
                        <p>Task updates and alerts</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffDashboard;
