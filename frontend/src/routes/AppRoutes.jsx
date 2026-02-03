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
import VisitQueue from '../pages/staff/VisitQueue';
import ActiveVisits from '../pages/doctor/ActiveVisits';
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/dev-login" element={<DevLogin />} />
                <Route path="/register/patient" element={<RegisterPatient />} />

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
                    path="/staff/visit-queue"
                    element={
                        <ProtectedRoute allowedRoles={['STAFF']}>
                            <VisitQueue />
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
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['STAFF']}>
                            <StaffDashboard />
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