import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AttendanceWidget = ({ percentage, total, present, label, subtext, details }) => {
    const [showDetails, setShowDetails] = React.useState(false);
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

            <button
                onClick={() => setShowDetails(true)}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200"
            >
                View Details
            </button>

            {/* Detail Overlay */}
            {showDetails && (
                <div className="absolute inset-0 bg-white rounded-3xl p-6 z-10 flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Attendance Report</h3>
                        <button onClick={() => setShowDetails(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-600">
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-600">Attendance Rate</span>
                                <span className="text-orange-600 font-bold">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <p className="text-xs text-green-600 font-bold uppercase">Present</p>
                                <p className="text-2xl font-bold text-gray-800">{present}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <p className="text-xs text-red-600 font-bold uppercase">Absent</p>
                                <p className="text-2xl font-bold text-gray-800">{total - present}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl text-center mt-auto">
                            <p className="text-xs text-gray-500 mb-1">Total Students Enrolled</p>
                            <p className="text-3xl font-black text-gray-900">{total}</p>
                        </div>

                        {/* Class Breakdown Section */}
                        {details && details.length > 0 && (
                            <div className="mt-6 border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Class-wise Breakdown</h4>
                                <div className="space-y-3">
                                    {details.map((cls, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">Class {cls.className}</p>
                                                <p className="text-xs text-gray-500">{cls.present} / {cls.total} Present</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-sm font-bold ${cls.percentage >= 75 ? 'text-green-600' : cls.percentage >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                                                    {cls.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceWidget;
