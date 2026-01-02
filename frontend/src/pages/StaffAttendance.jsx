import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import config from '../config';

const StaffAttendance = () => {
    const containerRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const [pendingCount, setPendingCount] = useState(0);

    // 1. Get GPS Location
    useEffect(() => {
        // Animate Container
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => setMsg("Error getting location: " + err.message)
            );
        } else {
            setMsg("Geolocation is not supported by your browser");
        }

        // Check offline queue on load
        updatePendingCount();

        // Listen for connection restoration
        window.addEventListener('online', syncOfflineData);
        return () => window.removeEventListener('online', syncOfflineData);
    }, []);

    const updatePendingCount = () => {
        const checkings = JSON.parse(localStorage.getItem('offline_attendance') || "[]");
        setPendingCount(checkings.length);
    };

    // 2. Submit Attendance
    const handleSubmit = async () => {
        if (!location) {
            alert("Please wait for GPS location!");
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert("Please Login First!");
            return;
        }

        setLoading(true);

        // Check Online Status
        if (!navigator.onLine) {
            // SAVE TO LOCAL STORAGE
            try {
                const offlineRecord = {
                    userId: user._id || user.id,
                    lat: location.lat,
                    lng: location.lng,
                    date: new Date().toISOString().split('T')[0],
                    timestamp: Date.now()
                };

                const existing = JSON.parse(localStorage.getItem('offline_attendance') || "[]");
                existing.push(offlineRecord);
                localStorage.setItem('offline_attendance', JSON.stringify(existing));

                setMsg("Offline! Attendance Saved Locally. 💾");
                updatePendingCount();
                alert("You are Offline. Attendance Saved! Will sync when online.");
                setLoading(false);
                return;
            } catch (err) {
                console.error("Storage Error:", err);
                alert("Failed to save offline.");
            }
        }

        // Online Submit
        const payload = {
            userId: user._id || user.id,
            lat: location.lat,
            lng: location.lng,
            date: new Date().toISOString().split('T')[0]
        };

        try {
            await axios.post(`${config.API_URL}/api/staff/check-in`, payload);
            alert("Attendance Marked Successfully!");
            setMsg("Attendance Marked! ✅");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Submission Failed");
        } finally {
            setLoading(false);
        }
    };

    // 3. Sync Logic
    const syncOfflineData = async () => {
        const offlineData = JSON.parse(localStorage.getItem('offline_attendance') || "[]");
        if (offlineData.length === 0) return;

        setMsg(`Syncing ${offlineData.length} records... ⏳`);

        const remaining = [];

        for (const record of offlineData) {
            try {
                const payload = {
                    userId: record.userId,
                    lat: record.lat,
                    lng: record.lng,
                    date: record.date
                };

                await axios.post(`${config.API_URL}/api/staff/check-in`, payload);

            } catch (err) {
                console.error("Sync Failed for a record:", err);
                // Keep it in storage if failed (unless it's a duplicate error)
                if (err.response?.status !== 400) {
                    remaining.push(record);
                }
            }
        }

        localStorage.setItem('offline_attendance', JSON.stringify(remaining));
        updatePendingCount();

        if (remaining.length === 0) {
            setMsg("All Offline Records Synced! ✅");
            alert("Sync Complete!");
        } else {
            setMsg(`Sync Partial. ${remaining.length} failed.`);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Mark Staff Attendance</h1>

                {/* Status Message */}
                {msg && <div className="bg-gray-700 p-3 rounded-lg mb-4 text-sm text-yellow-300 text-center">{msg}</div>}

                {/* Offline Queue Indicator */}
                {pendingCount > 0 && (
                    <div className="mb-6 bg-orange-600 p-4 rounded-lg flex justify-between items-center shadow-lg">
                        <span className="font-bold">⚠️ {pendingCount} Offline Records</span>
                        <button
                            onClick={syncOfflineData}
                            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                        >
                            Sync Now 🔄
                        </button>
                    </div>
                )}

                {/* Location Status */}
                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-4xl">📍</span>
                        <div>
                            <p className="text-sm text-gray-400">GPS Location</p>
                            {location ? (
                                <p className="text-green-400 font-mono text-sm">
                                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </p>
                            ) : (
                                <p className="text-red-400 animate-pulse">Fetching GPS...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !location}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition transform active:scale-95 ${loading || !location
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 shadow-lg'
                        }`}
                >
                    {loading ? "Submitting..." : "Check In ✅"}
                </button>

                <p className="text-center text-gray-500 text-xs mt-4">
                    Your attendance will be marked with GPS coordinates only
                </p>
            </div>
        </div>
    );
};

export default StaffAttendance;
