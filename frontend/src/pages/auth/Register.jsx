import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import './Auth.css';

// Tab Component
const Tab = ({ label, active, onClick }) => (
    <button
        className={`auth-tab ${active ? 'active' : ''}`}
        onClick={onClick}
        type="button"
    >
        {label}
    </button>
);

function Register() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('patient'); // patient, doctor, hospital
    const [step, setStep] = useState(1); // 1: Registration, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Patient State
    const [patientData, setPatientData] = useState({
        aadhaarId: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [patientVerifiedData, setPatientVerifiedData] = useState(null);

    // Doctor State
    const [doctorData, setDoctorData] = useState({
        regId: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        degreeCertificate: null,
        medicalRegCertificate: null
    });

    // Hospital State
    const [hospitalData, setHospitalData] = useState({
        organizationName: '',
        organizationType: 'hospital',
        licenseNumber: '',
        licenseDocument: null,
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
    });

    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState(null);

    // Handlers
    const handlePatientChange = (e) => setPatientData({ ...patientData, [e.target.name]: e.target.value });
    const handleDoctorChange = (e) => setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
    const handleHospitalChange = (e) => setHospitalData({ ...hospitalData, [e.target.name]: e.target.value });

    const handleFileChange = (e, role, field) => {
        if (role === 'doctor') {
            setDoctorData({ ...doctorData, [field]: e.target.files[0] });
        } else if (role === 'hospital') {
            setHospitalData({ ...hospitalData, [field]: e.target.files[0] });
        }
    };

    const validatePasswords = (password, confirmPassword) => {
        if (password !== confirmPassword) return 'Passwords do not match';
        if (password.length < 8) return 'Password must be at least 8 characters';
        return null;
    };

    const handleSubmitPatient = async (e) => {
        e.preventDefault();
        setError('');
        const pwdError = validatePasswords(patientData.password, patientData.confirmPassword);
        if (pwdError) { setError(pwdError); return; }

        setLoading(true);
        try {
            const res = await authApi.registerPatient(patientData);
            setUserId(res.data.userId); // Store userId for OTP
            setStep(2);
            setSuccessMsg(res.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDoctor = async (e) => {
        e.preventDefault();
        setError('');
        const pwdError = validatePasswords(doctorData.password, doctorData.confirmPassword);
        if (pwdError) { setError(pwdError); return; }

        if (!doctorData.degreeCertificate || !doctorData.medicalRegCertificate) {
            setError('Please upload all required documents');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        Object.keys(doctorData).forEach(key => {
            formData.append(key, doctorData[key]);
        });

        try {
            const res = await authApi.registerDoctor(formData);
            setUserId(res.data.userId);
            setStep(2);
            setSuccessMsg(res.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitHospital = async (e) => {
        e.preventDefault();
        setError('');
        const pwdError = validatePasswords(hospitalData.password, hospitalData.confirmPassword);
        if (pwdError) { setError(pwdError); return; }

        if (!hospitalData.licenseDocument) {
            setError('Please upload hospital license document');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        Object.keys(hospitalData).forEach(key => {
            formData.append(key, hospitalData[key]);
        });

        try {
            const res = await authApi.registerOrganization(formData);
            setUserId(res.data.userId);
            setStep(2);
            setSuccessMsg(res.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Need email to verify. 
            // We can get email from user input based on active tab
            let email = '';
            if (activeTab === 'patient') email = patientData.email;
            if (activeTab === 'doctor') email = doctorData.email;
            if (activeTab === 'hospital') email = hospitalData.email;

            await authApi.verifyOTP(email, otp);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Verify OTP</h2>
                    <p className="auth-subtitle">{successMsg || 'Enter OTP sent to your email/phone'}</p>
                    <form onSubmit={handleVerifyOTP}>
                        <Input
                            label="Enter OTP"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000000"
                            required
                        />
                        {error && <div className="error-alert">{error}</div>}
                        <Button type="submit" loading={loading}>Verify OTP</Button>
                        <Button type="button" variant="secondary" onClick={() => setStep(1)} style={{ marginTop: '10px' }}>Back</Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: activeTab === 'hospital' ? '600px' : '400px' }}>
                <h2>Create Account</h2>
                <div className="auth-tabs">
                    <Tab label="Patient" active={activeTab === 'patient'} onClick={() => setActiveTab('patient')} />
                    <Tab label="Doctor" active={activeTab === 'doctor'} onClick={() => setActiveTab('doctor')} />
                    <Tab label="Hospital" active={activeTab === 'hospital'} onClick={() => setActiveTab('hospital')} />
                </div>

                <div className="tab-content">
                    {activeTab === 'patient' && (
                        <form onSubmit={handleSubmitPatient}>
                            <Input label="Aadhaar ID (Mock: 123456789012)" name="aadhaarId" value={patientData.aadhaarId} onChange={handlePatientChange} required />
                            <Input label="Email" type="email" name="email" value={patientData.email} onChange={handlePatientChange} required />
                            <Input label="Phone" type="tel" name="phone" value={patientData.phone} onChange={handlePatientChange} required />
                            <Input label="Password" type="password" name="password" value={patientData.password} onChange={handlePatientChange} required />
                            <Input label="Confirm Password" type="password" name="confirmPassword" value={patientData.confirmPassword} onChange={handlePatientChange} required />
                            {error && <div className="error-alert">{error}</div>}
                            <Button type="submit" loading={loading}>Register Patient</Button>
                        </form>
                    )}

                    {activeTab === 'doctor' && (
                        <form onSubmit={handleSubmitDoctor}>
                            <Input label="Registration ID (Mock: REG12345)" name="regId" value={doctorData.regId} onChange={handleDoctorChange} required />
                            <Input label="Email" type="email" name="email" value={doctorData.email} onChange={handleDoctorChange} required />
                            <Input label="Phone" type="tel" name="phone" value={doctorData.phone} onChange={handleDoctorChange} required />
                            <Input label="Password" type="password" name="password" value={doctorData.password} onChange={handleDoctorChange} required />
                            <Input label="Confirm Password" type="password" name="confirmPassword" value={doctorData.confirmPassword} onChange={handleDoctorChange} required />

                            <div className="form-group">
                                <label>Degree Certificate</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'doctor', 'degreeCertificate')} accept=".pdf,.jpg,.jpeg,.png" required />
                            </div>
                            <div className="form-group">
                                <label>Medical Registration Certificate</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'doctor', 'medicalRegCertificate')} accept=".pdf,.jpg,.jpeg,.png" required />
                            </div>

                            {error && <div className="error-alert">{error}</div>}
                            <Button type="submit" loading={loading}>Register Doctor</Button>
                        </form>
                    )}

                    {activeTab === 'hospital' && (
                        <form onSubmit={handleSubmitHospital}>
                            <Input label="Hospital Name" name="organizationName" value={hospitalData.organizationName} onChange={handleHospitalChange} required />
                            <div className="form-group">
                                <label>Type</label>
                                <select name="organizationType" value={hospitalData.organizationType} onChange={handleHospitalChange} className="form-input">
                                    <option value="hospital">Hospital</option>
                                    <option value="clinic">Clinic</option>
                                    <option value="pharmacy">Pharmacy</option>
                                    <option value="laboratory">Laboratory</option>
                                    <option value="imaging_center">Imaging Center</option>
                                </select>
                            </div>
                            <Input label="License Number" name="licenseNumber" value={hospitalData.licenseNumber} onChange={handleHospitalChange} required />
                            <div className="form-group">
                                <label>License Document</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'hospital', 'licenseDocument')} accept=".pdf,.jpg,.jpeg,.png" required />
                            </div>
                            <Input label="Address" name="address" value={hospitalData.address} onChange={handleHospitalChange} required />
                            <div className="form-row">
                                <Input label="City" name="city" value={hospitalData.city} onChange={handleHospitalChange} required />
                                <Input label="State" name="state" value={hospitalData.state} onChange={handleHospitalChange} required />
                            </div>
                            <div className="form-row">
                                <Input label="Country" name="country" value={hospitalData.country} onChange={handleHospitalChange} required />
                                <Input label="Postal Code" name="postalCode" value={hospitalData.postalCode} onChange={handleHospitalChange} required />
                            </div>
                            <Input label="Email" type="email" name="email" value={hospitalData.email} onChange={handleHospitalChange} required />
                            <Input label="Phone" type="tel" name="phone" value={hospitalData.phone} onChange={handleHospitalChange} required />
                            <Input label="Password" type="password" name="password" value={hospitalData.password} onChange={handleHospitalChange} required />
                            <Input label="Confirm Password" type="password" name="confirmPassword" value={hospitalData.confirmPassword} onChange={handleHospitalChange} required />

                            {error && <div className="error-alert">{error}</div>}
                            <Button type="submit" loading={loading}>Register Hospital</Button>
                        </form>
                    )}
                </div>
                <div className="auth-footer">
                    Already have an account? <a href="/login">Login</a>
                </div>
            </div>
        </div>
    );
}

export default Register;
