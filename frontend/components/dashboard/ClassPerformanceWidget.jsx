import React from 'react';

const ClassPerformanceWidget = ({ info }) => {
    // info prop will be an array of { className, percentage, total, present }

    // Sort by Grade (numeric) then Section - though backend sort might be sufficient, client logic is safer
    // But backend is already sorting alphabetically by classSection string. Let's trust backend for simplicity
    // or adding a simple sort here if needed.

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                Class Performance
                <span className="text-xs font-normal text-gray-400 ml-auto">Attendance %</span>
            </h4>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {info && info.length > 0 ? (
                    info.map((cls) => (
                        <div key={cls.className} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-gray-700">Class {cls.className}</span>
                                <span className={`font-bold ${cls.percentage < 75 ? 'text-red-500' : 'text-green-600'}`}>{cls.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${cls.percentage >= 90 ? 'bg-green-500' :
                                            cls.percentage >= 75 ? 'bg-blue-400' :
                                                cls.percentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${cls.percentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-gray-400">{cls.present}/{cls.total} Present</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No class data available yet.</p>
                )}
            </div>
        </div>
    );
};

export default ClassPerformanceWidget;
