import React from 'react';
import { Users, UserX, Clock, Calendar, CheckCircle } from 'lucide-react';

const SummaryCards = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
                label="Student Attendance"
                value={`${data.studentPercentage}%`}
                sub={`${data.presentStudents} / ${data.totalStudents} Present`}
                icon={<CheckCircle size={24} />}
                color="blue"
            />
            <Card
                label="Absent Students"
                value={data.absentStudents}
                sub="Requires Attention"
                icon={<UserX size={24} />}
                color="red"
            />
            <Card
                label="Teachers Present"
                value={`${data.teacherStats?.present || 0}`}
                sub={`Out of ${data.teacherStats?.total || 0}`}
                icon={<Users size={24} />}
                color="green"
            />
            <Card
                label="Late Arrivals"
                value={data.teacherStats?.late || 0}
                sub="Teachers Today"
                icon={<Clock size={24} />}
                color="yellow"
            />
        </div>
    );
};

const Card = ({ label, value, sub, icon, color }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        green: "bg-green-500/10 text-green-500 border-green-500/20",
        yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    };

    return (
        <div className={`p-6 rounded-xl border ${colors[color].split(" ")[2]} bg-slate-900 shadow-lg`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-slate-400 text-sm font-medium">{label}</h4>
                    <p className="text-3xl font-bold text-white mt-2 font-outfit">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{sub}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;
