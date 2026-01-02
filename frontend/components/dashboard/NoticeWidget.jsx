import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Trash2, Send, Plus } from 'lucide-react';
import config from '../../src/config';

const NoticeWidget = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNotice, setNewNotice] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/notices/list`);
            setNotices(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch notices", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newNotice.trim()) return;
        setIsPosting(true);

        try {
            const token = localStorage.getItem('token');
            // Assuming backend uses req.user to set 'createdBy'
            await axios.post(`${config.API_URL}/api/notices/create`, {
                title: "Announcement", // Simple defaults for now, can expand later
                content: newNotice,
                audience: 'EVERYONE'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewNotice("");
            fetchNotices(); // Refresh list
        } catch (err) {
            alert("Failed to post notice");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${config.API_URL}/api/notices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(notices.filter(n => n._id !== id));
        } catch (err) {
            alert("Failed to delete notice");
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-purple-500" />
                School Notices
            </h3>

            {/* Post Form */}
            <form onSubmit={handlePost} className="mb-6 relative">
                <input
                    type="text"
                    value={newNotice}
                    onChange={(e) => setNewNotice(e.target.value)}
                    placeholder="Post a new announcement..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                    type="submit"
                    disabled={isPosting || !newNotice.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {loading ? (
                    <p className="text-center text-gray-400 text-sm">Loading notices...</p>
                ) : notices.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No notices yet.</p>
                    </div>
                ) : (
                    notices.map((notice) => (
                        <div key={notice._id} className="p-3 bg-purple-50 rounded-xl border border-purple-100 group relative">
                            <p className="text-gray-800 text-sm font-medium">{notice.content}</p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => handleDelete(notice._id)}
                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoticeWidget;
