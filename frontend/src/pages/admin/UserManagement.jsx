import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import Button from '../../components/common/Button';
import './UserManagement.css';

function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userApi.getAllUsers();

            if (data && data.success) {
                setUsers(data.data || []);
            } else {
                console.error('API returned no data:', data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }

    }, [navigate]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;

        try {
            const data = await userApi.deactivateStaff(userId);
            if (data.success) {
                alert('User deactivated successfully');
                fetchUsers();
            } else {
                alert('Failed to deactivate user: ' + data.message);
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            alert('Error deactivating user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.is_active) ||
            (filterStatus === 'inactive' && !user.is_active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadgeClass = (role) => {
        const roleMap = {
            'system_admin': 'badge-admin',
            'hospital_admin': 'badge-admin',
            'doctor': 'badge-doctor',
            'nurse': 'badge-nurse',
            'patient': 'badge-patient',
            'receptionist': 'badge-staff'
        };
        return roleMap[role] || 'badge-default';
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>User Management</h1>
                        <p className="header-subtitle">Manage user accounts, roles, and access permissions</p>
                    </div>
                    <Button onClick={() => navigate('/admin/dashboard')} variant="secondary" className="back-btn">
                        ← Back
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Search and Filters */}
                <div className="filters-container">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Roles</option>
                            <option value="system_admin">System Admin</option>
                            <option value="hospital_admin">Hospital Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="patient">Patient</option>
                            <option value="receptionist">Receptionist</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    {loading ? (
                        <p className="loading">Loading users...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="no-data">No users found</p>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-name">
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {user.is_active && user.role !== 'system_admin' && (
                                                <button
                                                    onClick={() => handleDeactivate(user.id)}
                                                    className="deactivate-btn"
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="stats-summary">
                    <div className="stat-box">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="stat-value">{filteredUsers.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div className="stat-value">{filteredUsers.filter(u => u.is_active).length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </div>
                        <div className="stat-value">{filteredUsers.filter(u => !u.is_active).length}</div>
                        <div className="stat-label">Inactive</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
