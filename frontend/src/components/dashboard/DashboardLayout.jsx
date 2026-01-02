import React, { useState } from 'react';
import { Home, Clipboard, Clock, Calendar, User, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, user, title, subtitle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        // "Home" (Dashboard) active state logic
        if (path === '/dashboard') {
            if (location.pathname === '/dashboard') return true;
            if (location.pathname.includes('/dashboard')) return true; // Covers /principal/dashboard, /parent/dashboard etc.
        }

        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const role = user?.role ? user.role.toUpperCase() : '';
    const isParent = role === 'PARENT';

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
            {/* Sidebar (Simplified for now - can be expanded) */}
            <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-8 gap-8 hidden md:flex">
                <div className="text-2xl font-bold text-gray-900">M</div>

                <nav className="flex flex-col gap-6">
                    <NavItem icon={<Home size={24} />} onClick={() => navigate('/dashboard')} active={isActive('/dashboard')} />
                    {!isParent && (
                        <>
                            <NavItem icon={<Clipboard size={24} />} onClick={() => navigate('/projects')} active={isActive('/projects')} />
                            <NavItem icon={<Clock size={24} />} onClick={() => navigate('/leave')} active={isActive('/leave')} />
                            <NavItem icon={<Calendar size={24} />} onClick={() => navigate('/plans')} active={isActive('/plans')} />
                        </>
                    )}
                </nav>

                <div className="mt-auto flex flex-col gap-6">
                    <NavItem icon={<User size={24} />} onClick={() => navigate('/profile')} active={isActive('/profile')} />
                    <NavItem icon={<Settings size={24} />} onClick={() => navigate('/settings')} active={isActive('/settings')} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Top Header */}
                    <header className="flex justify-between items-center mb-10">
                        {/* Brand / Logo Area for Mobile */}
                        <div className="md:hidden font-bold text-xl">M-scape</div>

                        {/* Navigation Pills */}
                        <div className="hidden md:flex bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100 items-center gap-1">
                            <NavPill label="Home" icon={<Home size={16} />} onClick={() => navigate('/dashboard')} active={isActive('/dashboard')} />
                            {!isParent && (
                                <>
                                    <NavPill label="Project" icon={<Clipboard size={16} />} onClick={() => navigate('/projects')} active={isActive('/projects')} />
                                    <NavPill label="Leave" icon={<Clock size={16} />} onClick={() => navigate('/leave')} active={isActive('/leave')} />
                                    <NavPill label="Plans" icon={<Calendar size={16} />} onClick={() => navigate('/plans')} active={isActive('/plans')} />
                                </>
                            )}
                        </div>

                        {/* Right Side Info */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="hidden md:flex items-center gap-2">
                                <span>12-04-2021</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>9:24 Mon</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-gray-900 font-medium">{user?.name || 'User'}</div>
                                    <div className="text-xs">{user?.role || 'Admin'}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=User+Name&background=0D8ABC&color=fff" alt="User" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Container */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[600px] relative overflow-hidden">
                        {/* Orange Border Effect */}
                        <div className="absolute top-0 left-0 w-full h-full border border-orange-400 rounded-3xl pointer-events-none opacity-50"></div>

                        <div className="mb-8">
                            {title && <h2 className="text-2xl font-bold text-gray-800">{title}</h2>}
                            {subtitle && <p className="text-gray-500">{subtitle}</p>}
                        </div>

                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components for Layout
const NavItem = ({ icon, active, onClick }) => (
    <button onClick={onClick} className={`p-3 rounded-xl transition-colors ${active ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:bg-gray-50'}`}>
        {icon}
    </button>
);

const NavPill = ({ label, icon, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${active ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-gray-600 hover:bg-gray-50'}`}>
        {icon}
        {label}
    </button>
);

export default DashboardLayout;
