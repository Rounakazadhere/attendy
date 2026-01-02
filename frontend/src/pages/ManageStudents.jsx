
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Edit, Trash2, UserPlus, Search, MessageCircle, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ManageStudents = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);

    // Message Modal State
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageData, setMessageData] = useState({ studentId: null, parentId: null, parentName: '', content: '' });

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            // Mock or Fetch Classes
            // For now simpler to hardcode or fetch if endpoint exists
            const defaults = [];
            for (let i = 1; i <= 10; i++) {
                ['A', 'B'].forEach(s => defaults.push(`${i}${s}`));
            }
            setClasses(defaults);
            // If you have an API: 
            // const res = await axios.get(`${config.API_URL}/api/classes`);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async (section) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.API_URL}/api/students/${section}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch students", err);
            setLoading(false);
        }
    };

    const handleClassChange = (e) => {
        const section = e.target.value;
        setSelectedClass(section);
        if (section) fetchStudents(section);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${config.API_URL}/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(students.filter(s => s._id !== id));
            alert("Student Deleted Successfully");
        } catch (err) {
            alert("Failed to delete student");
        }
    };

    return (
        <DashboardLayout user={user} title="Manage Students" subtitle="Add, Edit, or Remove students from the database">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
                            value={selectedClass}
                            onChange={handleClassChange}
                        >
                            <option value="">Select Class to View</option>
                            {classes.map(cls => (
                                <option key={cls} value={cls}>Class {cls}</option>
                            ))}
                        </select>
                    </div>

                    {user?.role !== 'STAFF' && (
                        <button
                            onClick={() => navigate('/add-student')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            <UserPlus size={20} />
                            Add New Student
                        </button>
                    )}
                </div>

                {/* Table */}
                {selectedClass && (
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading students...</div>
                        ) : students.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No students found in Class {selectedClass}</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                                        <th className="p-4 font-semibold border-b border-gray-100">Roll No</th>
                                        <th className="p-4 font-semibold border-b border-gray-100">Student ID</th>
                                        <th className="p-4 font-semibold border-b border-gray-100">Name</th>
                                        <th className="p-4 font-semibold border-b border-gray-100">Parent Phone</th>
                                        <th className="p-4 font-semibold border-b border-gray-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-mono text-gray-600 font-bold">{student.rollNumber}</td>
                                            <td className="p-4 font-mono text-xs text-gray-400 select-all" title={student._id}>{student._id}</td>
                                            <td className="p-4 font-medium text-gray-800">{student.name}</td>
                                            <td className="p-4 text-gray-500">{student.parentPhone}</td>
                                            <td className="p-4 flex justify-end gap-2">
                                                {/* Edit/Delete for Non-Staff */}
                                                {user?.role !== 'STAFF' && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/edit-student/${student._id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(student._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Chat Button (For Everyone, mainly Teachers) */}
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            const res = await axios.get(`${config.API_URL}/api/chat/parent/${student._id}`, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                            setMessageData({
                                                                studentId: student._id,
                                                                parentId: res.data._id,
                                                                parentName: res.data.name,
                                                                content: ''
                                                            });
                                                            setIsMessageModalOpen(true);
                                                        } catch (err) {
                                                            alert(err.response?.data?.error || "Parent not registered for this student.");
                                                        }
                                                    }}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                    title="Message Parent"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
                {!selectedClass && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p>Select a class above to manage students</p>
                    </div>
                )}
            </div>

            {/* Message Modal */}
            <AnimatePresence>
                {isMessageModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Message Parent</h3>
                                    <p className="text-sm text-gray-500">To: {messageData.parentName}</p>
                                </div>
                                <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <textarea
                                    rows="4"
                                    placeholder="Type your message, report, or feedback here..."
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                    value={messageData.content}
                                    onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                                ></textarea>
                                <button
                                    onClick={async () => {
                                        if (!messageData.content.trim()) return;
                                        try {
                                            const token = localStorage.getItem('token');
                                            await axios.post(`${config.API_URL}/api/chat`, {
                                                receiverId: messageData.parentId,
                                                content: messageData.content,
                                                studentId: messageData.studentId
                                            }, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            alert("Message Sent Successfully!");
                                            setIsMessageModalOpen(false);
                                        } catch (err) {
                                            alert("Failed to send message");
                                        }
                                    }}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                                >
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default ManageStudents;
