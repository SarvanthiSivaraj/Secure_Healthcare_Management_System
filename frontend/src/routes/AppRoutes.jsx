import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import RegisterPatient from '../pages/auth/RegisterPatient';
import DevLogin from '../pages/auth/DevLogin';
import PatientDashboard from '../pages/patient/Dashboard';
import DoctorDashboard from '../pages/doctor/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
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
import LabDashboard from '../pages/lab/Dashboard';
import RadiologistDashboard from '../pages/radiology/Dashboard';
import NewVisit from '../pages/patient/NewVisit';
import VisitManagement from '../pages/admin/VisitManagement';
import VerifyVisitOTP from '../pages/patient/VerifyVisitOTP';
import AcceptInvitation from '../pages/auth/AcceptInvitation';
import StaffManagement from '../pages/admin/StaffManagement';
import WorkflowDashboard from '../pages/staff/WorkflowDashboard';
import UserManagement from '../pages/admin/UserManagement';
import AuditLogs from '../pages/admin/AuditLogs';
import DoctorRegistration from '../pages/admin/DoctorRegistration';
import AuditTrail from '../pages/patient/AuditTrail';

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/dev-login" element={<DevLogin />} />
                <Route path="/register/patient" element={<RegisterPatient />} />
                <Route path="/staff/invitation/:token" element={<AcceptInvitation />} />

                {/* Protected Routes */}
                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/consent"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <Consent />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/visits"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <Visits />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/medical-records-view"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <MedicalRecordsView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff/visit-queue"
                    element={
                        <ProtectedRoute allowedRoles={['STAFF']}>
                            <VisitQueue />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/patients"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <PatientRecords />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/patients/:id/records"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <PatientMedicalRecords />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/consent"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <ConsentRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/notes"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <ClinicalNotes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/active-visits"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <ActiveVisits />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/medical-records"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <MedicalRecords />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/nurse/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['NURSE']}>
                            <NurseDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/lab/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['LAB_TECH', 'LAB_TECHNICIAN']}>
                            <LabDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/radiology/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['RADIOLOGIST']}>
                            <RadiologistDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/visits/new"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <NewVisit />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/visits/verify-otp"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <VerifyVisitOTP />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/audit-trail"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <AuditTrail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/visits"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                            <VisitManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/staff"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                            <StaffManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/audit-logs"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                            <AuditLogs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/doctor-registration"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                            <DoctorRegistration />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={[
                            'STAFF',
                            'NURSE',
                            'RECEPTIONIST',
                            'PHARMACIST',
                            'INSURANCE_PROVIDER',
                            'RESEARCHER',
                            'COMPLIANCE_OFFICER',
                            'ADMIN',
                            'HOSPITAL_ADMIN',
                            'SYSTEM_ADMIN'
                        ]}>
                            <StaffDashboard />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/staff/workflow"
                    element={
                        <ProtectedRoute allowedRoles={[
                            'STAFF', 'NURSE', 'DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'
                        ]}>
                            <WorkflowDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;