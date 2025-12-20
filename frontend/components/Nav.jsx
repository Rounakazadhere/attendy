import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

const Nav = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.role ? user.role.toUpperCase() : '';
    const isStaffOrPrincipal = ['ADMIN', 'PRINCIPAL', 'STAFF', 'TEACHER', 'HEADMASTER', 'STATE_ADMIN', 'DISTRICT_ADMIN'].some(r => role.includes(r));

    return (
        <nav className="bg-blue-600 p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">School App</Link>
                <div className="flex gap-4 items-center">
                    <Link to="/" className="hover:text-blue-200">Home</Link>

                    {user ? (
                        <>
                            {isStaffOrPrincipal && (
                                <>
                                    <Link to="/plans" className="hover:text-blue-200">Plans</Link>
                                    <Link to="/projects" className="hover:text-blue-200">Projects</Link>
                                    <Link to="/leave" className="hover:text-blue-200">Leave</Link>
                                    {(role === 'PRINCIPAL' || role === 'STATE_ADMIN') && (
                                        <Link to="/manage-students" className="hover:text-blue-200">Students</Link>
                                    )}
                                </>
                            )}

                            <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>

                            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-200">Login</Link>
                            <Link to="/register" className="hover:text-blue-200">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Nav;
