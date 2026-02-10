// Workflow Dashboard - Epic 4: Clinical Workflow
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { workflowApi } from '../../api/workflowApi';
import '../patient/Dashboard.css'; // Shared dashboard theme
import './WorkflowDashboard.css';

function WorkflowDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [beds, setBeds] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Determine back destination based on role
    const isAdmin = ['ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN'].includes(user?.role?.toUpperCase());
    const backPath = isAdmin ? '/admin/dashboard' : '/staff/dashboard';
    const backLabel = isAdmin ? 'Back to Admin Portal' : 'Back to Staff Portal';


    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bedsData, notifs, logsData] = await Promise.all([
                workflowApi.getAvailableBeds(),
                workflowApi.getUserNotifications(true),
                // workflowApi.getWorkflowLogs() // API might not be exposed to all roles, handled gracefully
            ]);

            setBeds(bedsData.data || bedsData || []);
            setNotifications(notifs.data || notifs || []);
        } catch (error) {
            console.error('Failed to load workflow data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAllocateBed = async () => {
        // Simple prompt for demo - in real app would be a modal
        const visitId = prompt("Enter Patient Visit ID:");
        if (!visitId) return;

        const ward = prompt("Enter Ward (e.g., General, ICU):", "General");
        const bed = prompt("Enter Bed Number:", "101");

        try {
            await workflowApi.allocateBed(visitId, ward, '1', bed, 'Allocated via Dashboard');
            alert('Bed allocated successfully!');
            fetchData();
        } catch (err) {
            alert('Failed to allocate bed: ' + err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Clinical Workflow Ops</h1>
                        <p className="header-subtitle">Real-time resource and task management</p>
                    </div>
                    <Button onClick={() => navigate(backPath)} variant="secondary">
                        {backLabel}
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="workflow-grid">
                    {/* Bed Management Card */}
                    <div className="workflow-card">
                        <div className="card-header">
                            <h2>🛏️ Bed Management</h2>
                            <Button onClick={handleAllocateBed} size="small">+ Allocate</Button>
                        </div>
                        <div className="card-content">
                            {loading ? <p>Loading beds...</p> : (
                                <div>
                                    <div className="stats-row">
                                        <div className="stat">
                                            <span className="number">{beds.length}</span>
                                            <span className="label">Available Beds</span>
                                        </div>
                                        <div className="stat">
                                            <span className="number">{beds.filter(b => b.ward === 'ICU').length}</span>
                                            <span className="label">ICU Vacancy</span>
                                        </div>
                                    </div>
                                    <div className="bed-list">
                                        {beds.length > 0 ? (
                                            beds.slice(0, 5).map((bed, i) => (
                                                <div key={i} className="bed-item available">
                                                    {bed.ward} - Bed {bed.bedNumber}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="empty-text">No beds available</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notifications / Tasks */}
                    <div className="workflow-card">
                        <div className="card-header">
                            <h2>🔔 Active Tasks</h2>
                        </div>
                        <div className="card-content">
                            {notifications.length === 0 ? (
                                <p className="empty-text">No active tasks</p>
                            ) : (
                                <ul className="task-list">
                                    {notifications.map(n => (
                                        <li key={n.id} className={`task-item ${n.priority}`}>
                                            <span className="task-message">{n.message}</span>
                                            <span className="task-time">{new Date(n.created_at).toLocaleTimeString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkflowDashboard;
