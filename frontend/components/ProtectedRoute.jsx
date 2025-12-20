import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading auth...</div>;
    }

    // 1. Check if authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check if role matches
    const userRoleNormal = user.role ? user.role.toUpperCase() : '';

    // Allow if permittedRoles is 'ALL' or includes the user's role
    // Normalize 'TEACHER' to 'STAFF' for compatibility if needed, though better to stick to one schema
    const effectiveRoles = [userRoleNormal];
    if (userRoleNormal === 'STAFF') effectiveRoles.push('TEACHER');
    if (userRoleNormal === 'TEACHER') effectiveRoles.push('STAFF');

    const isAuthorized = allowedRoles.includes('ALL') || allowedRoles.some(r => effectiveRoles.includes(r));

    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Authorized
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
