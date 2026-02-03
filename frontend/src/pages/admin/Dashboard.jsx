// Admin Dashboard
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import '../patient/Dashboard.css';

function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <Button onClick={logout} variant="secondary">Logout</Button>
            </header>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>Welcome, {user?.firstName || 'Admin'}!</h2>
                    <p>Organization: {user?.organizationName || 'Healthcare System'}</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Staff Management</h3>
                        <p>Onboard and manage staff</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Visit Management</h3>
                        <p>Create and manage visits</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Audit Logs</h3>
                        <p>View system audit trail</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Compliance Reports</h3>
                        <p>Generate GDPR/HIPAA reports</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
