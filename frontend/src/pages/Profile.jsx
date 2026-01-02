import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Briefcase, BadgeCheck, Phone } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth(); // Get user from context
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{greeting}, {user.name}!</h1>
                        <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-2">
                            <BadgeCheck size={18} className="text-blue-500" />
                            {user.role} | {user.employeeId || 'No ID'}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Identity Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <User className="text-purple-500" /> Personal Details
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="bg-white p-2 rounded-lg text-gray-400"><Mail size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email Address</p>
                                    <p className="text-gray-900 font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="bg-white p-2 rounded-lg text-gray-400"><Phone size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone</p>
                                    <p className="text-gray-900 font-medium">{user.mobile || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Org Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Briefcase className="text-blue-500" /> Organization
                        </h2>
                        <div className="space-y-4">
                            {user.schoolCode && (
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg text-gray-400"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">School Code</p>
                                        <p className="text-gray-900 font-bold">{user.schoolCode}</p>
                                    </div>
                                </div>
                            )}

                            {user.assignedClass && (
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg text-gray-400"><Briefcase size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Class Teacher</p>
                                        <p className="text-gray-900 font-medium">Class {user.assignedClass}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
