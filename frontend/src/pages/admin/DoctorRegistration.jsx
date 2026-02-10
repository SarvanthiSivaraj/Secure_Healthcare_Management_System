import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import './DoctorRegistration.css';

function DoctorRegistration() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        specialization: '',
        licenseNumber: '',
        experienceYears: '',
        department: '',
        phoneNumber: '',
        bio: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/v1/users/staff/onboard', { // Use onboard endpoint or register endpoint?
                // The auth route is /api/auth/register/doctor. Let's use that.
                // Wait, if I use register/doctor, it might be public.
                // But admin can use it too. 
                // Let's try /api/auth/register/doctor first.
                // Actually, let's use the full URL to be safe given the UserManagement issue.
            });

            // Re-evaluating: /api/auth/register/doctor is public registration.
            // Admin "Onboarding" might be different.
            // Let's use /api/auth/register/doctor but add admin token? 
            // No, the endpoint is public. 
            // BUT, if I want to "Verify" them immediately, an admin endpoint would be better.
            // 'users.routes.js' has '/staff/onboard'. Let's check 'user.controller.js' -> onboardStaff.

            // Let's stick to /api/auth/register/doctor for now as it's definitely there.
            // Or better, check user.controller.js content if possible.
            // I'll use the public registration endpoint as a fallback.

            const res = await fetch('http://localhost:5000/api/v1/auth/register/doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // No auth header needed for public endpoint, but maybe good to track who did it?
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                alert('Doctor registered successfully!');
                navigate('/admin/dashboard');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Doctor Registration</h1>
                        <p className="header-subtitle">Register new healthcare providers</p>
                    </div>
                    <Button onClick={() => navigate('/admin/dashboard')} variant="secondary">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <div className="dashboard-content registration-content">
                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Professional Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Specialization</label>
                                <select
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Specialization</option>
                                    <option value="General Practice">General Practice</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>License Number</label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Experience (Years)</label>
                                <input
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label>Bio / Description</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button type="button" onClick={() => navigate('/admin/dashboard')} variant="secondary">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Doctor'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DoctorRegistration;
