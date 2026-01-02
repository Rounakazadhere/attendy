import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const TeacherActivityWidget = ({ activity }) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                Teacher Activity
                <span className="text-xs font-normal text-gray-400 ml-auto">Today</span>
            </h4>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {activity && activity.length > 0 ? (
                    activity.map((teacher) => (
                        <div key={teacher._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${teacher.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {teacher.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{teacher.name}</p>
                                    <p className="text-xs text-gray-400">Class {teacher.assignedClass || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {teacher.status === 'Submitted' ? (
                                    <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-[10px] font-bold border border-green-100 flex items-center gap-1">
                                        <CheckCircle size={10} /> Done
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-400 text-[10px] font-bold border border-gray-100 flex items-center gap-1">
                                        <Clock size={10} /> Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No teacher activity found.</p>
                )}
            </div>
        </div>
    );
};

export default TeacherActivityWidget;
