import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import ThemeToggle from '../../components/common/ThemeToggle';
import ParticleBackground from '../../components/common/ParticleBackground';
import loginBg from '../../assets/images/login-bg.png';

// Reusable Components matching Login.jsx styles
const FormInput = ({ label, type = 'text', name, value, onChange, placeholder, required, icon }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-3 py-3 border border-gray-300 dark:border-dark-border rounded-xl leading-5 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 sm:text-sm shadow-sm`}
                placeholder={placeholder}
            />
        </div>
    </div>
);

const FormSelect = ({ label, name, value, onChange, options, icon }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    {icon}
                </div>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border border-gray-300 dark:border-dark-border rounded-xl leading-5 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 sm:text-sm shadow-sm appearance-none`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </div>
);

const FormButton = ({ children, loading, onClick, type = "submit", variant = "primary" }) => {
    const baseClasses = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]";
    const primaryClasses = "text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500 shadow-primary-500/30";
    const secondaryClasses = "text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-gray-500";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading}
            className={`${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : children}
        </button>
    );
};



function Register() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('patient');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // State definitions (same as before)
    const [patientData, setPatientData] = useState({ aadhaarId: '', phone: '', email: '', password: '', confirmPassword: '' });
    const [doctorData, setDoctorData] = useState({ regId: '', email: '', phone: '', password: '', confirmPassword: '', degreeCertificate: null, medicalRegCertificate: null });
    const [hospitalData, setHospitalData] = useState({ organizationName: '', organizationType: 'hospital', licenseNumber: '', licenseDocument: null, email: '', phone: '', password: '', confirmPassword: '', address: '', city: '', state: '', country: '', postalCode: '' });
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState(null);

    // Handlers (same as before)
    const handlePatientChange = (e) => setPatientData({ ...patientData, [e.target.name]: e.target.value });
    const handleDoctorChange = (e) => setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
    const handleHospitalChange = (e) => setHospitalData({ ...hospitalData, [e.target.name]: e.target.value });
    const handleFileChange = (e, role, field) => {
        if (role === 'doctor') setDoctorData({ ...doctorData, [field]: e.target.files[0] });
        else if (role === 'hospital') setHospitalData({ ...hospitalData, [field]: e.target.files[0] });
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
            setUserId(res.data.userId);
            setStep(2);
            setSuccessMsg(res.message);
        } catch (err) { setError(err.response?.data?.message || 'Registration failed'); } finally { setLoading(false); }
    };

    const handleSubmitDoctor = async (e) => {
        e.preventDefault();
        setError('');
        const pwdError = validatePasswords(doctorData.password, doctorData.confirmPassword);
        if (pwdError) { setError(pwdError); return; }
        if (!doctorData.degreeCertificate || !doctorData.medicalRegCertificate) { setError('Please upload all required documents'); return; }
        setLoading(true);
        const formData = new FormData();
        Object.keys(doctorData).forEach(key => formData.append(key, doctorData[key]));
        try {
            const res = await authApi.registerDoctor(formData);
            setUserId(res.data.userId);
            setStep(2);
            setSuccessMsg(res.message);
        } catch (err) { setError(err.response?.data?.message || 'Registration failed'); } finally { setLoading(false); }
    };

    const handleSubmitHospital = async (e) => {
        e.preventDefault();
        setError('');
        const pwdError = validatePasswords(hospitalData.password, hospitalData.confirmPassword);
        if (pwdError) { setError(pwdError); return; }
        if (!hospitalData.licenseDocument) { setError('Please upload hospital license document'); return; }
        setLoading(true);
        const formData = new FormData();
        Object.keys(hospitalData).forEach(key => formData.append(key, hospitalData[key]));
        try {
            const res = await authApi.registerOrganization(formData);
            setUserId(res.data.userId);
            setStep(2);
            setSuccessMsg(res.message);
        } catch (err) { setError(err.response?.data?.message || 'Registration failed'); } finally { setLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let email = '';
            if (activeTab === 'patient') email = patientData.email;
            if (activeTab === 'doctor') email = doctorData.email;
            if (activeTab === 'hospital') email = hospitalData.email;
            await authApi.verifyOTP(email, otp);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); } finally { setLoading(false); }
    };

    // OTP Step View
    if (step === 2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 transition-colors duration-300 relative overflow-hidden">
                <ParticleBackground />
                <div className="absolute top-4 right-4 z-50">
                    <ThemeToggle />
                </div>
                <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-card dark:shadow-none p-8 z-10 animate-fade-in text-center">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify OTP</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{successMsg || 'Enter OTP sent to your email/phone'}</p>
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <FormInput
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000000"
                            required
                            className="text-center text-2xl tracking-widest"
                        />
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <FormButton loading={loading}>Verify OTP</FormButton>
                        <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline">
                            Back to Registration
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 sm:p-6 lg:p-8 transition-colors duration-300 relative overflow-hidden">
            <ParticleBackground />

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-7xl bg-white dark:bg-dark-card rounded-3xl shadow-card dark:shadow-none hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-glow transform transition-all duration-500 overflow-hidden flex flex-col lg:flex-row min-h-[700px] animate-fade-in z-10">

                {/* Left Side: Image/Info */}
                <div className="hidden lg:flex w-5/12 relative flex-col justify-between p-12 text-white">
                    <div className="absolute inset-0 transition-transform duration-700 hover:scale-105">
                        <img
                            src={loginBg}
                            alt="Healthcare Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/95 to-primary-800/80 backdrop-blur-[1px]"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <span className="text-2xl">❤️</span>
                            </div>
                            <span className="text-2xl font-bold tracking-wide">SecureHealth</span>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight mb-6">Join Our Medical Network</h2>
                        <ul className="space-y-4 text-primary-100">
                            <li className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Seamless Patient Management</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Advanced Electronic Health Records</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Secure & Encrypted Data</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Side: Forms */}
                <div className="w-full lg:w-7/12 flex flex-col bg-white dark:bg-dark-card relative transition-colors duration-300">

                    {/* Tabs Header */}
                    <div className="relative flex border-b border-gray-200 dark:border-gray-700">
                        {/* Sliding Indicator (Background & Border) */}
                        <div
                            className="absolute bottom-0 h-full bg-primary-50/50 dark:bg-primary-900/10 border-b-2 border-primary-500 transition-all duration-300 ease-in-out"
                            style={{
                                width: '33.33%',
                                left: `${(['patient', 'doctor', 'hospital'].indexOf(activeTab)) * 33.33}%`
                            }}
                        />

                        {['patient', 'doctor', 'hospital'].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-4 text-center text-sm font-medium transition-colors duration-200 relative z-10 capitalize ${activeTab === tab
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {activeTab === 'patient' && 'Patient Registration'}
                                {activeTab === 'doctor' && 'Doctor Registration'}
                                {activeTab === 'hospital' && 'Hospital Registration'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Create your new account to get started.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center text-sm shadow-sm">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                {error}
                            </div>
                        )}

                        <div key={activeTab} className="animate-fade-in">
                            {activeTab === 'patient' && (
                                <form onSubmit={handleSubmitPatient} className="space-y-5">
                                    <FormInput label="Full Name" name="name" value={patientData.name || ''} onChange={handlePatientChange} placeholder="John Doe" required />
                                    <FormInput label="Aadhaar ID (Mock)" name="aadhaarId" value={patientData.aadhaarId} onChange={handlePatientChange} placeholder="1234 5678 9012" required />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Email" type="email" name="email" value={patientData.email} onChange={handlePatientChange} placeholder="john@example.com" required />
                                        <FormInput label="Phone" type="tel" name="phone" value={patientData.phone} onChange={handlePatientChange} placeholder="+91 9876543210" required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Password" type="password" name="password" value={patientData.password} onChange={handlePatientChange} placeholder="••••••••" required />
                                        <FormInput label="Confirm Password" type="password" name="confirmPassword" value={patientData.confirmPassword} onChange={handlePatientChange} placeholder="••••••••" required />
                                    </div>
                                    <FormButton loading={loading}>Register Patient</FormButton>
                                </form>
                            )}

                            {activeTab === 'doctor' && (
                                <form onSubmit={handleSubmitDoctor} className="space-y-5">
                                    <FormInput label="Full Name" name="name" value={doctorData.name || ''} onChange={handleDoctorChange} placeholder="Dr. Jane Doe" required />
                                    <FormInput label="Registration ID" name="regId" value={doctorData.regId} onChange={handleDoctorChange} placeholder="REG123456" required />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Email" type="email" name="email" value={doctorData.email} onChange={handleDoctorChange} placeholder="dr.jane@hospital.com" required />
                                        <FormInput label="Phone" type="tel" name="phone" value={doctorData.phone} onChange={handleDoctorChange} placeholder="+91 9876543210" required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Password" type="password" name="password" value={doctorData.password} onChange={handleDoctorChange} placeholder="••••••••" required />
                                        <FormInput label="Confirm Password" type="password" name="confirmPassword" value={doctorData.confirmPassword} onChange={handleDoctorChange} placeholder="••••••••" required />
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border space-y-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Credentials Verification</h4>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Degree Certificate</label>
                                            <input type="file" onChange={(e) => handleFileChange(e, 'doctor', 'degreeCertificate')} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Medical Registration</label>
                                            <input type="file" onChange={(e) => handleFileChange(e, 'doctor', 'medicalRegCertificate')} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400" required />
                                        </div>
                                    </div>
                                    <FormButton loading={loading}>Register Doctor</FormButton>
                                </form>
                            )}

                            {activeTab === 'hospital' && (
                                <form onSubmit={handleSubmitHospital} className="space-y-5">
                                    <FormInput label="Organization Name" name="organizationName" value={hospitalData.organizationName} onChange={handleHospitalChange} placeholder="City General Hospital" required />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormSelect
                                            label="Type"
                                            name="organizationType"
                                            value={hospitalData.organizationType}
                                            onChange={handleHospitalChange}
                                            options={[
                                                { value: 'hospital', label: 'Hospital' },
                                                { value: 'clinic', label: 'Clinic' },
                                                { value: 'pharmacy', label: 'Pharmacy' },
                                                { value: 'laboratory', label: 'Laboratory' },
                                                { value: 'imaging_center', label: 'Imaging Center' },
                                            ]}
                                        />
                                        <FormInput label="License Number" name="licenseNumber" value={hospitalData.licenseNumber} onChange={handleHospitalChange} placeholder="LIC-999999" required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Email" type="email" name="email" value={hospitalData.email} onChange={handleHospitalChange} required />
                                        <FormInput label="Phone" type="tel" name="phone" value={hospitalData.phone} onChange={handleHospitalChange} required />
                                    </div>

                                    <FormInput label="Address" name="address" value={hospitalData.address} onChange={handleHospitalChange} placeholder="123 Health St" required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="City" name="city" value={hospitalData.city} onChange={handleHospitalChange} placeholder="New York" required />
                                        <FormInput label="State" name="state" value={hospitalData.state} onChange={handleHospitalChange} placeholder="NY" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Country" name="country" value={hospitalData.country} onChange={handleHospitalChange} placeholder="USA" required />
                                        <FormInput label="Postal Code" name="postalCode" value={hospitalData.postalCode} onChange={handleHospitalChange} placeholder="10001" required />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput label="Password" type="password" name="password" value={hospitalData.password} onChange={handleHospitalChange} placeholder="••••••••" required />
                                        <FormInput label="Confirm Password" type="password" name="confirmPassword" value={hospitalData.confirmPassword} onChange={handleHospitalChange} placeholder="••••••••" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">License Document</label>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'hospital', 'licenseDocument')} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400" required />
                                    </div>

                                    <FormButton loading={loading}>Register Organization</FormButton>
                                </form>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Already have an account?{' '}
                                <a href="/login" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline transition-colors">
                                    Sign In
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
