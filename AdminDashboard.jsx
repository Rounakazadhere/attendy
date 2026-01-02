import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import QuickStatsCard from '../components/dashboard/StatsCard';
import { Building, MapPin, Users, Activity } from 'lucide-react';
import config from '../src/config';
import { useAuth } from '../src/context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    // Determine admin level for display
    const adminLevel = user?.role?.split('_')[0] || 'DISTRICT';
    const location = user?.[adminLevel.toLowerCase()] || 'Bihar';

    const [stats, setStats] = useState({
        totalSchools: 0,
        totalStudents: 0,
        avgAttendance: 0,
        alerts: 0
    });

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const res = await axios.get(`${config.API_URL}/api/admin/stats`);
                setStats(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchAdminStats();
    }, []);

    return (
        <DashboardLayout user={user} title={`${adminLevel} Dashboard`} subtitle={`Overview for ${location}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <QuickStatsCard
                    title="Total Schools"
                    description="Schools under jurisdiction"
                    icon={<Building size={24} className="text-gray-800" />}
                    status={stats.totalSchools}
                    statusColor="text-blue-600 font-bold text-xl"
                />
                <QuickStatsCard
                    title="Total Students"
                    description="Enrolled across region"
                    icon={<Users size={24} className="text-gray-800" />}
                    status={stats.totalStudents}
                    statusColor="text-green-600 font-bold text-xl"
                />
                <QuickStatsCard
                    title="Avg Attendance"
                    description="Today's average"
                    icon={<Activity size={24} className="text-gray-800" />}
                    status={`${stats.avgAttendance}% `}
                    statusColor="text-orange-600 font-bold text-xl"
                />
                <QuickStatsCard
                    title="Alerts"
                    description="Schools with low attendance"
                    icon={<MapPin size={24} className="text-gray-800" />}
                    status={stats.alerts}
                    statusColor="text-red-600 font-bold text-xl"
                />
            </div>

            {/* Region Map / List Placeholder */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 mb-6">{adminLevel} Level Reports</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 text-sm">
                                <th className="pb-3 px-4">Region / School</th>
                                <th className="pb-3 px-4">Principal</th>
                                <th className="pb-3 px-4">Attendance</th>
                                <th className="pb-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {/* Mock Data Rows */}
                            <tr className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-4 px-4 font-medium text-gray-800">Patna Central School</td>
                                <td className="py-4 px-4">R.K. Singh</td>
                                <td className="py-4 px-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">92%</span></td>
                                <td className="py-4 px-4">Active</td>
                            </tr>
                            <tr className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-4 px-4 font-medium text-gray-800">Gaya High School</td>
                                <td className="py-4 px-4">M. Gupta</td>
                                <td className="py-4 px-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">75%</span></td>
                                <td className="py-4 px-4">Needs Review</td>
                            </tr>
                            <tr className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-4 px-4 font-medium text-gray-800">Muzaffarpur Public</td>
                                <td className="py-4 px-4">S. Kumar</td>
                                <td className="py-4 px-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">45%</span></td>
                                <td className="py-4 px-4 text-red-500 font-bold">Critical</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
