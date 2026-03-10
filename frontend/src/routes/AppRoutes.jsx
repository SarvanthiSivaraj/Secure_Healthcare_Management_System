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
import NurseVitals from '../pages/nurse/NurseVitals';
import NurseSchedule from '../pages/nurse/NurseSchedule';
import LabDashboard from '../pages/lab/Dashboard';
import RadiologistDashboard from '../pages/radiology/Dashboard';
import ImagingQueue from '../pages/radiology/ImagingQueue';
import ReportUpload from '../pages/radiology/ReportUpload';
import RadiologistProfile from '../pages/radiology/RadiologistProfile';
import RadiologistAuditLogs from '../pages/radiology/RadiologistAuditLogs';
import PharmacistDashboard from '../pages/pharmacist/Dashboard';
import PharmacistPrescriptionQueue from '../pages/pharmacist/PrescriptionQueue';
import PharmacistInventory from '../pages/pharmacist/Inventory';
import PharmacistProfile from '../pages/pharmacist/PharmacistProfile';
import PharmacistAuditLogs from '../pages/pharmacist/PharmacistAuditLogs';

// Compliance Officer Pages
import ComplianceDashboard from '../pages/compliance/Dashboard';
import GlobalAuditLogs from '../pages/compliance/GlobalAuditLogs';
import Incidents from '../pages/compliance/Incidents';
import ConsentOverrides from '../pages/compliance/ConsentOverrides';
import ComplianceProfile from '../pages/compliance/Profile';

// Insurance Pages
import InsuranceDashboard from '../pages/insurance/Dashboard';
import InsuranceClaimsManagement from '../pages/insurance/ClaimsManagement';
import InsuranceCoverageVerification from '../pages/insurance/CoverageVerification';
import InsurancePolicyholders from '../pages/insurance/Policyholders';
import InsuranceProfile from '../pages/insurance/Profile';

// Researcher Pages
import ResearcherDashboard from '../pages/researcher/Dashboard';
import ResearcherDataExplorer from '../pages/researcher/DataExplorer';
import ResearcherProfile from '../pages/researcher/Profile';

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
import Support from '../pages/patient/Support';
import Messages from '../pages/patient/Messages';
import AIChatbot from '../pages/patient/AIChatbot';
import TriageQueue from '../pages/doctor/TriageQueue';

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
                path="/patient/chatbot"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <AIChatbot />
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
                path="/doctor/triage-sessions"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <TriageQueue />
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
                path="/patient/messages"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <Messages />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/support"
                element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <Support />
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
                path="/nurse/vitals"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <NurseVitals />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/schedule"
                element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <NurseSchedule />
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

            <Route
                path="/profile"
                element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'staff', 'nurse', 'lab_tech', 'lab_technician', 'radiologist', 'admin', 'hospital_admin', 'system_admin', 'pharmacist', 'receptionist']}>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/radiology/profile"
                element={
                    <ProtectedRoute allowedRoles={['radiologist']}>
                        <RadiologistProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/radiology/audit-logs"
                element={
                    <ProtectedRoute allowedRoles={['radiologist']}>
                        <RadiologistAuditLogs />
                    </ProtectedRoute>
                }
            />

            {/* Pharmacist Routes */}
            <Route
                path="/pharmacist/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['pharmacist']}>
                        <PharmacistDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/pharmacist/prescriptions"
                element={
                    <ProtectedRoute allowedRoles={['pharmacist']}>
                        <PharmacistPrescriptionQueue />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/pharmacist/inventory"
                element={
                    <ProtectedRoute allowedRoles={['pharmacist']}>
                        <PharmacistInventory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/pharmacist/profile"
                element={
                    <ProtectedRoute allowedRoles={['pharmacist']}>
                        <PharmacistProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/pharmacist/audit-logs"
                element={
                    <ProtectedRoute allowedRoles={['pharmacist']}>
                        <PharmacistAuditLogs />
                    </ProtectedRoute>
                }
            />

            {/* Compliance Officer Routes */}
            <Route
                path="/compliance/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['compliance_officer']}>
                        <ComplianceDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compliance/global-audits"
                element={
                    <ProtectedRoute allowedRoles={['compliance_officer']}>
                        <GlobalAuditLogs />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compliance/incidents"
                element={
                    <ProtectedRoute allowedRoles={['compliance_officer']}>
                        <Incidents />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compliance/consent-overrides"
                element={
                    <ProtectedRoute allowedRoles={['compliance_officer']}>
                        <ConsentOverrides />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compliance/profile"
                element={
                    <ProtectedRoute allowedRoles={['compliance_officer']}>
                        <ComplianceProfile />
                    </ProtectedRoute>
                }
            />

            {/* Insurance Routes */}
            <Route
                path="/insurance/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['insurance', 'insurance_provider']}>
                        <InsuranceDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insurance/claims"
                element={
                    <ProtectedRoute allowedRoles={['insurance', 'insurance_provider']}>
                        <InsuranceClaimsManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insurance/coverage"
                element={
                    <ProtectedRoute allowedRoles={['insurance', 'insurance_provider']}>
                        <InsuranceCoverageVerification />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insurance/policyholders"
                element={
                    <ProtectedRoute allowedRoles={['insurance', 'insurance_provider']}>
                        <InsurancePolicyholders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insurance/profile"
                element={
                    <ProtectedRoute allowedRoles={['insurance', 'insurance_provider']}>
                        <InsuranceProfile />
                    </ProtectedRoute>
                }
            />

            {/* Researcher Routes */}
            <Route
                path="/researcher/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['researcher']}>
                        <ResearcherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/researcher/explorer"
                element={
                    <ProtectedRoute allowedRoles={['researcher']}>
                        <ResearcherDataExplorer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/researcher/profile"
                element={
                    <ProtectedRoute allowedRoles={['researcher']}>
                        <ResearcherProfile />
                    </ProtectedRoute>
                }
            />

            {/* Default redirect */}
            <Route path="/" element={<LandingPage />} />
        </Routes>
    );
}
export default AppRoutes;