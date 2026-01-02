import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, CheckCircle, Clock, FileText, User, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import config from '../config';

const PlanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        fetchTaskDetails();
    }, [id]);

    const fetchTaskDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.API_URL}/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTask(res.data);
        } catch (err) {
            console.error("Error fetching task details:", err);
            setError("Failed to load task details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout user={user}>
                <div className="p-20 text-center text-gray-500">Loading task details...</div>
            </DashboardLayout>
        );
    }

    if (error || !task) {
        return (
            <DashboardLayout user={user}>
                <div className="p-20 text-center text-red-500">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p>{error || "Task not found."}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user} title="Task Details" subtitle="View complete information about this task.">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Plans
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {task.priority || 'Normal'} Priority
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-gray-400 text-sm flex items-center">
                                                <Calendar size={14} className="mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">{task.title}</h1>
                                </div>
                                <div className={`p-3 rounded-xl ${task.completed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {task.completed ? <CheckCircle size={24} /> : <Clock size={24} />}
                                </div>
                            </div>

                            <div className="prose max-w-none text-gray-600">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                <p className="mb-6">{task.description}</p>

                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Instructions</h3>
                                <p className="leading-relaxed whitespace-pre-line">{task.details || "No detailed instructions provided."}</p>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <FileText size={20} className="mr-2 text-gray-400" />
                                Comments & Notes
                            </h3>
                            {task.comments && task.comments.length > 0 ? (
                                <div className="space-y-6">
                                    {task.comments.map((comment, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                {comment.user ? comment.user.charAt(0) : '?'}
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-sm text-gray-800">{comment.user || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-400">{new Date(comment.time).toLocaleString()}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No comments yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Task Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Status</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {task.completed ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Category</span>
                                    <span className="text-gray-800 text-sm font-medium">{task.category}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Assignee</span>
                                    <div className="flex items-center text-gray-800 text-sm font-medium">
                                        <User size={14} className="mr-2 text-blue-500" />
                                        {task.assignedToRole || 'Specific User'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">History</h3>
                            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white ring-1 ring-blue-500"></div>
                                    <p className="text-sm font-medium text-gray-800">Task Created</p>
                                    <p className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-400"></div>
                                    <p className="text-sm font-medium text-gray-800">Last Updated</p>
                                    <p className="text-xs text-gray-400">{new Date(task.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PlanDetails;
