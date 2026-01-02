import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Clock } from 'lucide-react';
import config from '../../config';

const LeaveApprovalWidget = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            // FIX: Corrected endpoint from /leaves to /leave match backend index.js
            const res = await axios.get(`${config.API_URL}/api/leave/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, status) => {
        let rejectionReason = "";

        if (status === 'Rejected') {
            const reason = window.prompt("Please provide a reason for rejection (optional):");
            if (reason === null) return; // User cancelled
            rejectionReason = reason;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${config.API_URL}/api/leave/${id}/status`, { status, rejectionReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from list
            setRequests(requests.filter(req => req._id !== id));
            alert(`Leave request ${status.toLowerCase()}!`);
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status.toLowerCase()} request: ${err.response?.data?.error || err.message}`);
        }
    };

    if (loading) return <div className="text-gray-400 text-sm">Loading pending leaves...</div>;

    if (requests.length === 0) return null; // Hide if no pending requests

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-orange-500" />
                Pending Leave Requests
            </h4>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {requests.map((req) => (
                    <div key={req._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h5 className="font-bold text-gray-800">{req.applicantId?.name || "Unknown"}</h5>
                                <p className="text-xs text-gray-500">{req.type} Leave • {req.dates.length} Days</p>
                            </div>
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-bold">
                                {req.status}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded border border-gray-100 italic">
                            "{req.reason}"
                        </p>
                        <p className="text-xs text-gray-400 mb-3">Dates: {req.dates.join(", ")}</p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction(req._id, 'Approved')}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                                <Check size={14} /> Approve
                            </button>
                            <button
                                onClick={() => handleAction(req._id, 'Rejected')}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                                <X size={14} /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaveApprovalWidget;
