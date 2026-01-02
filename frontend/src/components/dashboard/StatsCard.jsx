import React from 'react';

const QuickStatsCard = ({ title, description, icon, status, statusColor }) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
            {/* Background Circle Decoration */}
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-50 to-transparent opacity-50 rounded-r-3xl"></div>

            <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <h4 className="font-bold text-gray-800">{title}</h4>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-3 max-w-[80%]">{description}</p>
                {status && (
                    <span className={`text-xs font-bold ${statusColor || "text-gray-500"}`}>
                        {status}
                    </span>
                )}
            </div>

            <div className="w-12 h-12 rounded-full border-4 border-orange-100 flex items-center justify-center text-orange-500 z-10 bg-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </div>
        </div>
    );
};

export default QuickStatsCard;
