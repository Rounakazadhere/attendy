import React, { useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { X } from 'lucide-react';
import config from '../../config';

const LeaveWidget = ({ used, total, allowApply = true }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Casual',
        startDate: '',
        days: 1,
        reason: ''
    });

    const data = [
        { name: 'Used', value: used },
        { name: 'Remaining', value: total - used }
    ];
    // Orange and Light Gray
    const COLORS = ['#F97316', '#F3F4F6'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate dates array
            const dates = [];
            let currentDate = new Date(formData.startDate);
            for (let i = 0; i < formData.days; i++) {
                dates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            await axios.post(`${config.API_URL}/api/leave/apply`, {
                type: formData.type,
                dates,
                reason: formData.reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Leave application submitted successfully!");
            setIsModalOpen(false);
            setFormData({ type: 'Casual', startDate: '', days: 1, reason: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to apply for leave: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
                <div className="absolute top-4 right-4 text-gray-400">
                    {/* Info Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-4 self-start">Leave stats</h3>

                <div className="w-40 h-40 relative flex items-center justify-center">
                    {/* Inner Content */}
                    <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">{used}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold">Days</span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={65}
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

                <div className="text-xl font-bold text-gray-800 mt-2">{used}/{total}</div>
                {allowApply && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200"
                    >
                        Apply for leave
                    </button>
                )}
            </div>

            {/* Modal */}
            {allowApply && isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-800 mb-6">Apply for Leave</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Urgent">Urgent Work</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        required
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.days}
                                        onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Brief reason for leave..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors shadow-md disabled:bg-orange-300"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default LeaveWidget;
