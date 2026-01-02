import React from 'react';

const CalendarWidget = () => {
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [viewDate, setViewDate] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = getDaysInMonth(viewDate);
    const startDay = getFirstDayOfMonth(viewDate);

    // Generate calendar grid
    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null); // Empty slots
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const isToday = (day) => {
        return day === currentTime.getDate() &&
            viewDate.getMonth() === currentTime.getMonth() &&
            viewDate.getFullYear() === currentTime.getFullYear();
    };

    const changeMonth = (offset) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            {/* Header with Clock */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Calendar</h3>
                    <p className="text-sm text-gray-500">
                        {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 font-mono tracking-wider">
                        {formatTime(currentTime)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase font-bold mt-1">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                    onClick={() => setViewDate(new Date())}
                    className="text-xs font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest"
                >
                    Today
                </button>
                <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {days.map(d => <div key={d} className="font-bold text-gray-400 py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm flex-1 content-start">
                {calendarDays.map((date, idx) => (
                    <div key={idx} className="aspect-square flex items-center justify-center p-1">
                        {date ? (
                            <div
                                className={`
                                    w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300
                                    ${isToday(date)
                                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 scale-110'
                                        : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
                                `}
                            >
                                {date}
                            </div>
                        ) : (
                            <span></span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarWidget;
