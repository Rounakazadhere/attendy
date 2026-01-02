import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import GooeyNav from '../components/GooeyNav';

const Nav = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.role ? user.role.toUpperCase() : '';
    const isStaffOrPrincipal = [
        'ADMIN',
        'PRINCIPAL',
        'STAFF',
        'TEACHER',
        'HEADMASTER',
        'STATE_ADMIN',
        'DISTRICT_ADMIN'
    ].some(r => role.includes(r));

    const menuItems = [
        // { label: "Home", path: "/" },
        { label: "Plans", path: "/plans" },
        { label: "Projects", path: "/projects" },
        { label: "Leave", path: "/leave" },
        { label: "Students", path: "/manage-students" },
    ];

    return (
        <nav className="bg-black p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">

                {/* LEFT */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="hover:bg-white/10 p-2 rounded-full"
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <Link to="/" className="text-xl font-bold">
                        Attendify
                    </Link>
                </div>

                {/* CENTER – GooeyNav */}
                {user && isStaffOrPrincipal && (
                    <div className="relative h-[60px] mx-6">
                        <GooeyNav
                            items={menuItems}
                            onItemClick={(item) => navigate(item.path)}
                        />
                    </div>
                )}

                {/* RIGHT */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hover:text-gray-300">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-gray-300">Login</Link>
                            <Link to="/register" className="hover:text-gray-300">Register</Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Nav;
