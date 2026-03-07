import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DevLogin from '../pages/auth/DevLogin';
import PatientDashboard from '../pages/patient/Dashboard';
import DoctorDashboard from '../pages/doctor/Dashboard';
import HospitalAdminDashboard from '../pages/admin/HospitalAdminDashboard';
import StaffDashboard from '../pages/staff/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Consent from '../pages/patient/Consent';
import Visits from '../pages/patient/Visits';
import MedicalRecords from '../pages/patient/MedicalRecords';
import MedicalRecordsView from '../pages/patient/MedicalRecordsView';
import VisitQueue from '../pages/staff/VisitQueue';
import ActiveVisits from '../pages/doctor/ActiveVisits';
import PatientRecords from '../pages/doctor/PatientRecords';
import PatientMedicalRecords from '../pages/doctor/PatientMedicalRecords';
import ConsentRequests from '../pages/doctor/ConsentRequests';
import ClinicalNotes from '../pages/doctor/ClinicalNotes';
import NurseDashboard from '../pages/nurse/Dashboard';
import AssignedPatients from '../pages/nurse/AssignedPatients';
import NursePatientRecords from '../pages/nurse/NursePatientRecords';
import NurseMedications from '../pages/nurse/NurseMedications';
import NurseProfile from '../pages/nurse/NurseProfile';
import LabDashboard from '../pages/lab/Dashboard';
import RadiologistDashboard from '../pages/radiology/Dashboard';
import ImagingQueue from '../pages/radiology/ImagingQueue';
import ReportUpload from '../pages/radiology/ReportUpload';
import NewVisit from '../pages/patient/NewVisit';
import ScheduleNewVisit from '../pages/patient/ScheduleNewVisit';
import GrantConsent from '../pages/patient/GrantConsent';
import VisitManagement from '../pages/admin/VisitManagement';
import VerifyVisitOTP from '../pages/patient/VerifyVisitOTP';
import AcceptInvitation from '../pages/auth/AcceptInvitation';
import StaffManagement from '../pages/admin/StaffManagement';
import WorkflowDashboard from '../pages/staff/WorkflowDashboard';
import UserManagement from '../pages/admin/UserManagement';
import AuditLogs from '../pages/admin/AuditLogs';
import DoctorRegistration from '../pages/admin/DoctorRegistration';
import DoctorVerification from '../pages/admin/DoctorVerification';
import AuditTrail from '../pages/patient/AuditTrail';
import Profile from '../pages/common/Profile';
import LandingPage from '../pages/LandingPage';
import ReceptionistVisitManagement from '../pages/receptionist/ReceptionistVisitManagement';
import PatientRegistration from '../pages/staff/PatientRegistration';

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/dev-login" element={<DevLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/staff/invitation/:token" element={<AcceptInvitation />} />

            {/* Protected Routes */}
            <Route
                path="/patient/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/patient/consent"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <Consent />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/consent/grant"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <GrantConsent />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/visits"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <Visits />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/medical-records-view"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <MedicalRecordsView />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/staff/registration"
                element={
                    <ProtectedRoute allowedRoles={['receptionist', 'nurse', 'staff']}>
                        <PatientRegistration />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/staff/visit-queue"
                element={
                    <ProtectedRoute allowedRoles={['staff']}>
                        <VisitQueue />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/patients"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PatientRecords />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/patients/:id/records"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PatientMedicalRecords />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/consent"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ConsentRequests />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/notes"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ClinicalNotes />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/active-visits"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ActiveVisits />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/medical-records"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <MedicalRecords />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <NurseDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/patients"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <AssignedPatients />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/patients/:id/records"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <NursePatientRecords />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/medications"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <NurseMedications />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/profile"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <NurseProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/lab/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['lab_tech', 'lab_technician']}>
                        <LabDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/radiology/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['radiologist']}>
                        <RadiologistDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/radiology/queue"
                element={
                    <ProtectedRoute allowedRoles={['radiologist']}>
                        <ImagingQueue />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/radiology/upload"
                element={
                    <ProtectedRoute allowedRoles={['radiologist']}>
                        <ReportUpload />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <HospitalAdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/visits/new"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <NewVisit />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/visits/schedule"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <ScheduleNewVisit />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/visits/verify-otp"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <VerifyVisitOTP />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/audit-trail"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <AuditTrail />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/visits"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <VisitManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/staff"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <StaffManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <UserManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/audit-logs"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <AuditLogs />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/doctor-registration"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <DoctorRegistration />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/doctor-verification"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin', 'system_admin']}>
                        <DoctorVerification />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/receptionist/visits"
                element={
                    <ProtectedRoute allowedRoles={['receptionist']}>
                        <ReceptionistVisitManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/staff/dashboard"
                element={
                    <ProtectedRoute allowedRoles={[
                        'staff',
                        'nurse',
                        'receptionist',
                        'pharmacist',
                        'insurance_provider',
                        'researcher',
                        'compliance_officer',
                        'admin',
                        'hospital_admin',
                        'system_admin'
                    ]}>
                        <StaffDashboard />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/staff/workflow"
                element={
                    <ProtectedRoute allowedRoles={[
                        'staff', 'nurse', 'doctor', 'admin', 'hospital_admin', 'system_admin', 'receptionist'
                    ]}>
                        <WorkflowDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/profile"
                element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'staff', 'nurse', 'lab_tech', 'lab_technician', 'radiologist', 'admin', 'hospital_admin', 'system_admin']}>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Default redirect */}
            <Route path="/" element={<LandingPage />} />
        </Routes>
    );
}
export default AppRoutes;