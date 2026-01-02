import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AttendanceWidget = ({ percentage, total, present, label, subtext }) => {
    const data = [
        { name: 'Present', value: present },
        { name: 'Absent', value: total - present }
    ];
    // Orange and Light Gray
    const COLORS = ['#F97316', '#F3F4F6'];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
            <div className="absolute top-4 right-4 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-6 self-start">{label || "Attendance"}</h3>

            <div className="w-56 h-56 relative flex items-center justify-center">
                {/* Inner Content */}
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-gray-900">{percentage}%</span>
                    <span className="text-sm text-gray-500">{subtext || "Present Today"}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={10}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs uppercase mb-1">Present</div>
                    <div className="text-white text-xl font-bold">{present}</div>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs uppercase mb-1">Total</div>
                    <div className="text-gray-900 text-xl font-bold">{total}</div>
                </div>
            </div>

            <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200">
                View Details
            </button>
        </div>
    );
};

export default AttendanceWidget;
