import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CheckCircle, Circle, ClipboardList, BookOpen, UserCheck, Calendar, Eye, X, Plus, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import config from '../src/config';

// Icon mapping
const ICON_MAP = {
    'ClipboardList': ClipboardList,
    'UserCheck': UserCheck,
    'BookOpen': BookOpen,
    'Calendar': Calendar,
    'AlertCircle': AlertCircle
};

const Plans = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        details: '',
        category: 'General',
        priority: 'Medium',
        dueDate: '',
        assignedToRole: '', // Default: Private
        assignedToUser: ''
    });

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            // Default to Private Task
            setNewTask(prev => ({
                ...prev,
                assignedToRole: '',
                assignedToUser: parsedUser._id
            }));
        }
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.API_URL}/api/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (id) => {
        // Optimistic update
        const originalTasks = [...tasks];
        setTasks(tasks.map(t => t._id === id ? { ...t, completed: !t.completed } : t));

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${config.API_URL}/api/tasks/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Could re-fetch to be sure, but optimistic is fine
        } catch (err) {
            console.error("Error toggling task:", err);
            setTasks(originalTasks); // Revert on error
            alert("Failed to update task status");
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();

        let currentUserId = user?._id || newTask.assignedToUser;

        // SELF-HEALING: If User ID is missing (Stale Session), fetch it!
        if (!newTask.assignedToRole && !currentUserId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No token");

                const res = await axios.get(`${config.API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const freshUser = res.data;
                currentUserId = freshUser._id;

                // Update State & Storage
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));

                // Continue with fresh ID
                console.log("Session healed! User ID recovered:", currentUserId);
            } catch (healErr) {
                console.error("Session heal failed", healErr);
                alert("System Update: Your session is too old. Please Logout and Login again.");
                return;
            }
        }

        const payload = {
            ...newTask,
            assignedToUser: !newTask.assignedToRole ? currentUserId : ''
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/tasks`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsCreateModalOpen(false);
            fetchTasks();
            setNewTask({
                title: '', description: '', details: '',
                category: 'General', priority: 'Medium', dueDate: '',
                assignedToRole: '', // Default Private
                assignedToUser: currentUserId || ''
            });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create task");
        }
    };

    const openDetails = (task, e) => {
        e.stopPropagation();
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const getIcon = (category) => {
        if (category === 'Admin') return ClipboardList;
        if (category === 'Monitoring' || category === 'Daily Routine') return UserCheck;
        if (category === 'Academic') return BookOpen;
        if (category === 'Meeting') return Calendar;
        return ClipboardList;
    };

    const getColor = (category) => {
        if (category === 'Admin' || category === 'Academic') return 'text-blue-500 bg-blue-50';
        if (category === 'Monitoring' || category === 'Daily Routine') return 'text-green-500 bg-green-50';
        if (category === 'Meeting') return 'text-orange-500 bg-orange-50';
        return 'text-purple-500 bg-purple-50';
    };

    return (
        <DashboardLayout user={user} title="Daily Plans" subtitle={`Manage your daily tasks and action items, ${user?.name || 'User'}.`}>
            <div className="max-w-4xl mx-auto relative">

                <div className="flex justify-end mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                        <Plus size={18} />
                        Add Task
                    </motion.button>
                </div>

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{tasks.length}</h3>
                            <p className="text-sm text-gray-500">Total Tasks</p>
                        </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{tasks.filter(t => t.completed).length}</h3>
                            <p className="text-sm text-gray-500">Completed</p>
                        </div>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                            <Circle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{tasks.filter(t => !t.completed).length}</h3>
                            <p className="text-sm text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>No tasks assigned for today!</p>
                        </div>
                    ) : (
                        tasks.map((task, index) => {
                            const Icon = getIcon(task.category);
                            const colorClass = getColor(task.category);

                            return (
                                <motion.div
                                    key={task._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${task.completed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100 hover:shadow-md hover:border-blue-200'
                                        }`}
                                    onClick={() => toggleTask(task._id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <button className={`p-1 rounded-full transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}>
                                            {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                        </button>
                                        <div>
                                            <h4 className={`font-semibold text-lg ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                {task.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 hidden sm:block">{task.description}</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 inline-block mt-1 sm:hidden`}>
                                                {task.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => openDetails(task, e)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <div className={`p-2 rounded-lg ${colorClass}`}>
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Task Details Modal */}
                <AnimatePresence>
                    {isModalOpen && selectedTask && (
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getColor(selectedTask.category)}`}>
                                            {(() => {
                                                const Icon = getIcon(selectedTask.category);
                                                return <Icon size={24} />;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                                            <span className="text-sm text-gray-500">{selectedTask.category}</span>
                                        </div>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Description</h4>
                                        <p className="text-gray-600">{selectedTask.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Detailed Information</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed">
                                            {selectedTask.details || "No details provided."}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedTask.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            Status: {selectedTask.completed ? 'Completed' : 'Pending'}
                                        </span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/plans/${selectedTask._id}`;
                                            }}
                                            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center"
                                        >
                                            <Eye size={16} className="mr-2" />
                                            View Full Page
                                        </button>

                                        <button
                                            onClick={() => {
                                                toggleTask(selectedTask._id);
                                                closeModal();
                                            }}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTask.completed
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                        >
                                            {selectedTask.completed ? 'Mark as Pending' : 'Mark as Completed'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Create Task Modal */}
                <AnimatePresence>
                    {isCreateModalOpen && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-lg text-gray-800">Add New Task</h3>
                                    <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Instructions</label>
                                        <textarea
                                            rows="3"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newTask.details}
                                            onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={newTask.category}
                                                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                            >
                                                <option value="General">General</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Academic">Academic</option>
                                                <option value="Meeting">Meeting</option>
                                                <option value="Monitoring">Monitoring</option>
                                                <option value="Daily Routine">Daily Routine</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!newTask.assignedToRole}
                                                        onChange={(e) => setNewTask({
                                                            ...newTask,
                                                            assignedToRole: e.target.checked ? '' : (user?.role || 'STAFF'),
                                                            assignedToUser: e.target.checked ? user?._id : ''
                                                        })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    Private (Only Me)
                                                </label>
                                                {newTask.assignedToRole && (
                                                    <select
                                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={newTask.assignedToRole}
                                                        onChange={(e) => setNewTask({ ...newTask, assignedToRole: e.target.value, assignedToUser: '' })}
                                                    >
                                                        <option value="STAFF">All Teachers</option>
                                                        <option value="PRINCIPAL">Principal Only</option>
                                                        <option value="ADMIN">Admin Only</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                                        >
                                            Create Task
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default Plans;
