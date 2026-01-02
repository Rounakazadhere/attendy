import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import LeaveWidget from '../components/dashboard/LeaveWidget';
import ClassPerformanceWidget from '../components/dashboard/ClassPerformanceWidget';
import TeacherActivityWidget from '../components/dashboard/TeacherActivityWidget';
import LeaveApprovalWidget from '../components/dashboard/LeaveApprovalWidget';
import NoticeWidget from '../components/dashboard/NoticeWidget'; // New Import
import config from '../src/config';
import { useAuth } from '../src/context/AuthContext';

const socket = io(config.API_URL);

const PrincipalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        attendancePercentage: 0
    });

    const [classPerformance, setClassPerformance] = useState([]);
    const [teacherActivity, setTeacherActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [statsRes, perfRes, activityRes] = await Promise.all([
                axios.get(`${config.API_URL}/api/admin/stats`),
                axios.get(`${config.API_URL}/api/admin/class-performance`),
                axios.get(`${config.API_URL}/api/admin/teacher-activity`)
            ]);

            const data = statsRes.data;

            setStats({
                totalStudents: data.totalStudents,
                presentToday: data.presentToday,
                absentToday: data.absentToday,
                attendancePercentage: data.avgAttendance
            });
            setClassPerformance(perfRes.data);
            setTeacherActivity(activityRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch Principal stats", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        socket.on('attendance_update', () => fetchStats());
        socket.on('student_deleted', () => fetchStats());

        return () => {
            socket.off('attendance_update');
            socket.off('student_deleted');
        };
    }, []);

    return (
        <DashboardLayout user={user} title={`Hi, ${user?.name || 'Principal'}`} subtitle="Good Morning, Have a good day">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Attendance */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <AttendanceWidget
                        percentage={stats.attendancePercentage}
                        total={stats.totalStudents}
                        present={stats.presentToday}
                        label="School Attendance"
                        subtext="Present Today"
                        details={classPerformance}
                    />

                    {/* Teacher Activity Widget */}
                    <TeacherActivityWidget activity={teacherActivity} />
                </div>

                {/* Middle Column: Welcome & Class Performance */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    {/* Welcome Banner */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Good Morning</h3>
                            <p className="text-gray-500 text-sm">Have a good day</p>
                        </div>
                        <div className="w-24">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/man-working-on-laptop-2917088-2436794.png" alt="Working" />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/add-student')}
                            className="bg-blue-600 text-white p-4 rounded-2xl shadow-md hover:bg-blue-700 transition flex flex-col items-center justify-center gap-2"
                        >
                            <span className="text-2xl">+</span>
                            <span className="font-bold text-sm">Add Student</span>
                        </button>
                        <button
                            onClick={() => navigate('/manage-students')}
                            className="bg-purple-600 text-white p-4 rounded-2xl shadow-md hover:bg-purple-700 transition flex flex-col items-center justify-center gap-2"
                        >
                            <span className="text-2xl">✎</span>
                            <span className="font-bold text-sm">Manage Logs</span>
                        </button>
                    </div>
                </div>

                {/* Class Performance Widget */}
                <ClassPerformanceWidget info={classPerformance} />

                {/* Right Column: Calendar & Leave Stats */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    <CalendarWidget />
                    <LeaveWidget used={16} total={20} allowApply={false} />
                    <LeaveApprovalWidget />
                    <div className="h-[400px]">
                        <NoticeWidget />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PrincipalDashboard;
