import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.role ? user.role.toUpperCase() : '';

    if (role === 'PRINCIPAL' || role === 'HEADMASTER') {
        return <Navigate to="/principal/dashboard" replace />;
    }

    // Normalize 'TEACHER' and 'STAFF'
    if (role === 'STAFF' || role === 'TEACHER') {
        return <Navigate to="/teacher/dashboard" replace />;
    }

    if (role === 'PARENT') {
        return <Navigate to="/parent/dashboard" replace />;
    }

    if (role.includes('ADMIN')) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Default Fallback
    return <Navigate to="/unauthorized" replace />;
};

export default Dashboard;
