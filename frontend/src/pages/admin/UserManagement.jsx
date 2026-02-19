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
            const response = await fetch('/api/v1/users/staff/deactivate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();
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
                    <Button onClick={() => navigate('/admin/dashboard')} variant="secondary">
                        Back to Dashboard
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
                        <div className="stat-value">{filteredUsers.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value">{filteredUsers.filter(u => u.is_active).length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value">{filteredUsers.filter(u => !u.is_active).length}</div>
                        <div className="stat-label">Inactive</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
