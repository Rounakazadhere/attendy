import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Check, X, Clock } from 'lucide-react';

const LeaveRequestsList = () => {
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/leave/pending`);
            setLeaves(res.data);
        } catch (err) {
            console.error("Failed to fetch leaves");
        }
    };

    const handleAction = async (id, status) => {
        const remarks = prompt(`Enter remarks for ${status} (optional):`);
        // Principal ID needs to be sent
        // const user = JSON.parse(localStorage.getItem('user'));
        const user = { _id: "64f1b2b2b2b2b2b2b2b2b2b2" }; // Mock

        try {
            await axios.put(`${config.API_URL}/api/leave/responsed/${id}`, {
                status,
                remarks: remarks || "",
                approvedBy: user._id
            });
            fetchLeaves(); // Refresh
        } catch (err) {
            alert("Action failed");
        }
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-slate-200">Pending Leave Requests</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ maxHeight: '400px' }}>
                {leaves.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                        <Clock size={32} className="mb-2 opacity-50" />
                        <p>No pending requests.</p>
                    </div>
                ) : (
                    leaves.map(leave => (
                        <div key={leave._id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white">ID: {leave.requestedBy?.substring(0, 6) || "User"}...</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${leave.role === 'TEACHER' ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-blue-900/30 border-blue-500 text-blue-300'}`}>
                                            {leave.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {leave.startDate} to {leave.endDate}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-yellow-900/20 text-yellow-500 border border-yellow-600/30 rounded">
                                    {leave.status}
                                </span>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded text-sm text-slate-300 italic border border-slate-800">
                                "{leave.reason}"
                            </div>

                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => handleAction(leave._id, 'APPROVED')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Check size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(leave._id, 'REJECTED')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <X size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaveRequestsList;
