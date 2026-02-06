import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import './StaffInvite.css';

function StaffInvite({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'DOCTOR',
        specialization: '',
        licenseNumber: '',
        department: '',
        shiftStart: '09:00',
        shiftEnd: '17:00',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // TODO: Replace with actual API call
            // await staffApi.inviteStaff(formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            onSuccess && onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send staff invitation');
        } finally {
            setLoading(false);
        }
    };

    const getRoleSpecificFields = () => {
        if (formData.role === 'DOCTOR') {
            return (
                <>
                    <Input
                        label="Specialization"
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Cardiology, Pediatrics"
                        required
                    />
                    <Input
                        label="Medical License Number"
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="Enter medical license number"
                        required
                    />
                </>
            );
        }

        if (formData.role === 'NURSE') {
            return (
                <>
                    <Input
                        label="Department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Emergency, ICU, General"
                        required
                    />
                    <div className="form-row">
                        <Input
                            label="Shift Start Time"
                            type="time"
                            name="shiftStart"
                            value={formData.shiftStart}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Shift End Time"
                            type="time"
                            name="shiftEnd"
                            value={formData.shiftEnd}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </>
            );
        }

        if (formData.role === 'LAB_TECHNICIAN' || formData.role === 'RADIOLOGIST') {
            return (
                <Input
                    label="Department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Department name"
                    required
                />
            );
        }

        return null;
    };

    return (
        <div className="staff-invite-container">
            <div className="invite-header">
                <h3>Invite Staff Member</h3>
                <p className="invite-subtitle">
                    Send an invitation to a new staff member to join your organization
                </p>
            </div>

            <form onSubmit={handleSubmit} className="staff-invite-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h4 className="section-title">Basic Information</h4>

                    <div className="form-row">
                        <Input
                            label="First Name"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                            required
                        />
                        <Input
                            label="Last Name"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="staff@example.com"
                            required
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            required
                        />
                    </div>
                </div>

                {/* Role Selection */}
                <div className="form-section">
                    <h4 className="section-title">Role & Credentials</h4>

                    <div className="form-group">
                        <label htmlFor="role">Staff Role *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="form-select"
                        >
                            <option value="DOCTOR">Doctor</option>
                            <option value="NURSE">Nurse</option>
                            <option value="LAB_TECHNICIAN">Lab Technician</option>
                            <option value="RADIOLOGIST">Radiologist</option>
                            <option value="PHARMACIST">Pharmacist</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                        </select>
                    </div>

                    {getRoleSpecificFields()}
                </div>

                {error && <div className="error-alert">{error}</div>}

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        Send Invitation
                    </Button>
                </div>
            </form>

            <div className="invitation-info">
                <div className="info-box">
                    <span className="info-box-icon">✉️</span>
                    <div>
                        <p className="info-box-title">Invitation Email</p>
                        <p className="info-box-text">
                            An email will be sent to the staff member with instructions to
                            complete their registration and verify their credentials.
                        </p>
                    </div>
                </div>

                <div className="info-box">
                    <span className="info-box-icon">🔐</span>
                    <div>
                        <p className="info-box-title">Access Control</p>
                        <p className="info-box-text">
                            Staff permissions will be assigned based on their role. They will
                            only access data relevant to their assigned tasks and visits.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffInvite;
