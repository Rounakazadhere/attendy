import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Plus, Trash2, Send, AlertTriangle } from 'lucide-react';

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', message: '', targetAudience: 'ALL', isEmergency: false
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/notices/list`);
            setNotices(res.data);
        } catch (err) {
            console.error("Failed to fetch notices");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Assuming current user ID is stored/available (mock for now if needed, or get from localStorage)
        const user = JSON.parse(localStorage.getItem('user'));
        const payload = { ...formData, createdBy: user?._id || "64f1b2b2b2b2b2b2b2b2b2b2" }; // Fallback ID for testing

        try {
            await axios.post(`${config.API_URL}/api/notices/create`, payload);
            fetchNotices();
            setShowForm(false);
            setFormData({ title: '', message: '', targetAudience: 'ALL', isEmergency: false });
            alert("Notice sent successfully!");
        } catch (err) {
            alert("Failed to send notice");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this notice?")) return;
        try {
            await axios.delete(`${config.API_URL}/api/notices/${id}`);
            fetchNotices();
        } catch (err) {
            alert("Failed to delete notice");
        }
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Notice Board</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                    <Plus size={16} /> Create Notice
                </button>
            </div>

            {showForm && (
                <div className="p-6 bg-slate-950/50 border-b border-slate-800 animate-fade-in">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Notice Title"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <textarea
                                placeholder="Message content..."
                                rows="3"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div className="flex gap-4 items-center">
                            <select
                                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none text-sm"
                                value={formData.targetAudience}
                                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                            >
                                <option value="ALL">Everyone</option>
                                <option value="TEACHERS">Teachers Only</option>
                                <option value="STUDENTS">Students Only</option>
                            </select>

                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isEmergency}
                                    onChange={e => setFormData({ ...formData, isEmergency: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 text-red-500 focus:ring-red-500 bg-slate-800"
                                />
                                <span className={formData.isEmergency ? "text-red-400 font-bold" : ""}>Emergency Alert</span>
                            </label>

                            <button type="submit" className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <Send size={16} /> Send
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ maxHeight: '400px' }}>
                {notices.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No notices yet.</p>
                ) : (
                    notices.map(notice => (
                        <div key={notice._id} className={`p-4 rounded-lg border ${notice.isEmergency ? 'bg-red-900/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {notice.isEmergency && <AlertTriangle size={16} className="text-red-500" />}
                                    <h4 className={`font-bold ${notice.isEmergency ? 'text-red-400' : 'text-slate-200'}`}>{notice.title}</h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                                        {notice.targetAudience}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    <button onClick={() => handleDelete(notice._id)} className="text-slate-500 hover:text-red-400">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{notice.message}</p>
                            <div className="mt-2 text-xs text-slate-500 flex justify-between">
                                <span>From: {notice.createdBy?.name || 'Principal'}</span>
                                <span className={notice.deliveryStatus?.delivered > 0 ? "text-green-500" : ""}>
                                    {/* Mock status */}
                                    {Math.floor(Math.random() * 100)}% Read
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;
