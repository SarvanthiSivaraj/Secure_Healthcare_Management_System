import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Handle both 'role' and 'roleName' (normalize to lowercase)
    const userRole = (user.role || user.roleName)?.toLowerCase();
    console.log('🔐 ProtectedRoute check:', { userRole, allowedRoles, user });

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.error('❌ Access denied:', { userRole, allowedRoles });
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
}
export default ProtectedRoute;