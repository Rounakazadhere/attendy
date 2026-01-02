import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Activity, FileText, ChevronDown, Calendar as CalendarIcon, FileUp } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import QuickStatsCard from '../components/dashboard/StatsCard';
import NoticeWidget from '../components/dashboard/NoticeWidget';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [stats, setStats] = useState({ notices: 0, attendance: "0%" });
    const [loading, setLoading] = useState(true);

    // Leave Modal State
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveType, setLeaveType] = useState("Sick");
    const [leaveDates, setLeaveDates] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${config.API_URL}/api/parent/my-children`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChildren(res.data);
                if (res.data.length > 0) {
                    setSelectedChild(res.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch children", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    useEffect(() => {
        if (!selectedChild) return;
        const fetchChildData = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch basic stats (notices)
                const statsRes = await axios.get(`${config.API_URL}/api/parent/dashboard-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });


                // Fetch Attendance History
                const logsRes = await axios.get(`${config.API_URL}/api/parent/child/${selectedChild._id}/attendance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAttendanceLogs(logsRes.data);

                // Calculate percentage based on current month for simplicity or just show raw
                // Let's use the field from student if available
                setStats({
                    notices: statsRes.data.notices,
                    attendance: selectedChild.currentAttendancePercentage + "%"
                });

            } catch (err) {
                console.error("Failed to fetch child data", err);
            }
        };
        fetchChildData();
    }, [selectedChild]);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/parent/leave`, {
                studentId: selectedChild._id,
                type: leaveType,
                dates: [leaveDates], // Single day for now MVP
                reason: leaveReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Leave Request Submitted!");
            setShowLeaveModal(false);
            setLeaveReason("");
        } catch (err) {
            alert("Failed to apply leave");
        }
    };

    return (
        <DashboardLayout user={user} title="Parent Portal" subtitle="Track your child's progress">

            {/* Child Selector */}
            {children.length > 0 && (
                <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-flex">
                    <span className="text-gray-500 font-medium">Viewing Profile:</span>
                    <div className="relative">
                        <select
                            className="appearance-none bg-blue-50 text-blue-700 font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none cursor-pointer"
                            value={selectedChild?._id || ""}
                            onChange={(e) => setSelectedChild(children.find(c => c._id === e.target.value))}
                        >
                            {children.map(child => (
                                <option key={child._id} value={child._id}>{child.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Refs for Scrolling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Attendance Card - Click to Scroll */}
                <div onClick={() => document.getElementById('attendance-section').scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer transition hover:scale-105">
                    <QuickStatsCard
                        title="Attendance"
                        description="Click to view history"
                        icon={<User size={24} className="text-gray-800" />}
                        status={stats.attendance}
                        statusColor="text-blue-600 font-bold text-xl"
                    />
                </div>

                {/* Notices Card - Click to Scroll */}
                <div onClick={() => document.getElementById('notices-section').scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer transition hover:scale-105">
                    <QuickStatsCard
                        title="School Notices"
                        description="Click to view board"
                        icon={<FileText size={24} className="text-gray-800" />}
                        status={stats.notices}
                        statusColor="text-orange-600 font-bold text-xl"
                    />
                </div>

                {/* Action Card: Apply Leave */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition hover:scale-105" onClick={() => setShowLeaveModal(true)}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-100`}>
                        <FileUp size={24} className="text-gray-800" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Quick Action</p>
                        <h4 className="font-bold text-gray-800 text-lg">Apply Leave</h4>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Attendance History */}
                <div id="attendance-section" className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <CalendarIcon size={20} className="text-blue-500" />
                        Attendance History
                    </h3>

                    <div className="space-y-3">
                        {attendanceLogs.length === 0 ? (
                            <p className="text-gray-400 italic">No attendance records found.</p>
                        ) : (
                            attendanceLogs.map((log) => (
                                <div key={log._id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${log.status === 'Present' ? 'bg-green-500' :
                                            log.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}></div>
                                        <div>
                                            <p className="font-bold text-gray-800">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-xs text-gray-400">Marked at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${log.status === 'Present' ? 'bg-green-100 text-green-700' :
                                        log.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {log.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Notices */}
                <div id="notices-section" className="w-full lg:w-1/3">
                    <NoticeWidget readOnly={true} />
                </div>
            </div>

            {/* Leave Application Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Apply for Leave</h3>

                        <form onSubmit={handleLeaveSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Urgent">Urgent Work</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={leaveDates}
                                    onChange={(e) => setLeaveDates(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    placeholder="Brief reason for absence..."
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowLeaveModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
};

export default ParentDashboard;
