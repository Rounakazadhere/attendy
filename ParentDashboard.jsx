import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import QuickStatsCard from '../components/dashboard/StatsCard';
import { User, Activity, FileText } from 'lucide-react';
import config from '../src/config';
import { useAuth } from '../src/context/AuthContext';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [stats, setStats] = useState({ notices: 0, events: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch basic stats
                const statsRes = await axios.get(`${config.API_URL}/api/parent/dashboard-stats`);
                setStats(statsRes.data);

                // Fetch linked children
                const childrenRes = await axios.get(`${config.API_URL}/api/parent/my-children`);
                setChildren(childrenRes.data);
            } catch (e) {
                console.error("Failed to load parent data", e);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout user={user} title="Parent Portal" subtitle="View your child's progress">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <QuickStatsCard
                    title="Children Linked"
                    description="Active profiles"
                    icon={<User size={24} className="text-gray-800" />}
                    status={children.length}
                    statusColor="text-blue-600 font-bold text-xl"
                />
                <QuickStatsCard
                    title="School Notices"
                    description="Recent updates"
                    icon={<FileText size={24} className="text-gray-800" />}
                    status={stats.notices}
                    statusColor="text-orange-600 font-bold text-xl"
                />
                <QuickStatsCard
                    title="Events"
                    description="Upcoming"
                    icon={<Activity size={24} className="text-gray-800" />}
                    status={stats.events}
                    statusColor="text-green-600 font-bold text-xl"
                />
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 mb-6">My Children</h3>
                <div className="grid gap-6">
                    {children.length === 0 ? (
                        <p className="text-gray-500 italic">No children linked yet. Please contact the school.</p>
                    ) : (
                        children.map((child) => (
                            <div key={child._id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {child.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{child.name}</h4>
                                        <p className="text-sm text-gray-500">Class: {child.classSection} | Roll: {child.rollNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${child.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {child.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ParentDashboard;
