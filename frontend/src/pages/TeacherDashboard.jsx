import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';
import QuickStatsCard from '../components/dashboard/StatsCard';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import { Users, BookOpen, AlertCircle } from 'lucide-react';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const socket = io(config.API_URL);

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const assignedClass = user?.assignedClass || "5A"; // Default to 5A if not set

    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        percentage: 0,
        absentees: []
    });
    const [recentLogs, setRecentLogs] = useState([]);

    const fetchClassStats = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/students/${assignedClass}`);
            const students = res.data;
            const total = students.length;
            const present = students.filter(s => s.status === "Present").length;
            const absentees = students.filter(s => s.status === "Absent").map(s => s.name);
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            setStats({ total, present, percentage, absentees });
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRecentLogs = async () => {
        try {
            // Reusing the get today's log endpoint for now. 
            // Ideally we'd have a /logs/history/:class endpoint. 
            // But let's show today's log as "Recent" which is correct for a daily view.
            const res = await axios.get(`${config.API_URL}/api/students/log/${assignedClass}`);
            setRecentLogs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchClassStats();
        fetchRecentLogs();
        socket.on('attendance_update', fetchClassStats);
        return () => socket.off('attendance_update');
    }, [assignedClass]);

    return (
        <DashboardLayout user={user} title={`Hi, ${user?.name || 'Teacher'}`} subtitle={`Class ${assignedClass} Overview`}>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Class Attendance */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <AttendanceWidget
                        percentage={stats.percentage}
                        total={stats.total}
                        present={stats.present}
                        label="Class Attendance"
                        subtext="Students Present"
                    />

                    {/* Take Attendance Button */}
                    <button
                        onClick={() => navigate('/attendance', { state: { classId: assignedClass } })}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <Users size={20} />
                        Take Attendance
                    </button>
                </div>

                {/* Middle Column */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                        <h3 className="text-xl font-bold text-orange-800 mb-2">Class {assignedClass} Status</h3>
                        <p className="text-orange-600 text-sm">Maths Period is ongoing.</p>
                    </div>

                    {/* Recent Logs Widget */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-blue-500" />
                            Recent Topics Taught
                        </h4>
                        <ul className="space-y-3">
                            {recentLogs.length > 0 ? (
                                recentLogs.slice(0, 3).map((log, idx) => (
                                    <li key={idx} className="flex items-start gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{log.topic}</p>
                                            <p className="text-xs text-gray-400">{log.subject} • {log.date}</p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 text-xs italic">No logs found for today.</li>
                            )}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-4">Quick status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QuickStatsCard
                                title="Students"
                                description="Total Students in Class"
                                icon={<Users size={20} className="text-gray-800" />}
                                status={stats.total}
                                statusColor="text-blue-500"
                            />
                            <QuickStatsCard
                                title="Syllabus"
                                description="Maths Chapter 4"
                                icon={<BookOpen size={20} className="text-gray-800" />}
                                status="Ongoing"
                                statusColor="text-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    <CalendarWidget />

                    {/* Absentees List Widget */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-500" />
                            Absentees Today
                        </h3>
                        <ul className="space-y-3">
                            {stats.absentees.length > 0 ? (
                                stats.absentees.map((name, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">{name[0]}</div>
                                        <span className="text-gray-600">{name}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 text-sm">No absentees today! 🎉</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
