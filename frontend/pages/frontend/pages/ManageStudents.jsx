
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../src/config';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Edit, Trash2, UserPlus, Search, MessageCircle } from 'lucide-react';

const ManageStudents = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);

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
                                        <th className="p-4 font-semibold border-b border-gray-100">Name</th>
                                        <th className="p-4 font-semibold border-b border-gray-100">Parent Phone</th>
                                        {user?.role !== 'STAFF' && <th className="p-4 font-semibold border-b border-gray-100 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-mono text-gray-600 font-bold">{student.rollNumber}</td>
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
                                                        // Quick logic: Find parent -> Go to Chat
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            const res = await axios.get(`${config.API_URL}/api/chat/parent/${student._id}`, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                            // If parent found, navigate to chat with them (Pre-select logic needed in future, but for now just go to chat page or alert)
                                                            // Ideally pass state to /chat to auto-open
                                                            alert(`Starting chat with parent: ${res.data.name}`);
                                                            // We can't auto-open without passing state, let's keep it simple:
                                                            // In a real app, I'd pass state: { startChatWith: res.data }
                                                            navigate('/chat');
                                                        } catch (err) {
                                                            alert("Parent not registered on the app yet.");
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
        </DashboardLayout>
    );
};

export default ManageStudents;
