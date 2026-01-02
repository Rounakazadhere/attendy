import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Plus, X, Calendar, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import config from '../src/config';

const Project = () => {
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        status: 'Active',
        progress: 0
    });

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(res.data);
        } catch (err) {
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/projects`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchProjects();
            setFormData({ title: '', description: '', deadline: '', status: 'Active', progress: 0 });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create project");
        }
    };

    return (
        <DashboardLayout user={user} title="Projects" subtitle="Manage and track ongoing school initiatives.">
            <div className="flex justify-end mb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Project
                </motion.button>
            </div>

            {loading ? (
                <div className="text-center p-10 text-gray-500">Loading...</div>
            ) : projects.length === 0 ? (
                <div className="text-center p-20 text-gray-400">
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No projects found. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full"
                        >
                            <div className={`h-2 w-full rounded-full mb-4 ${project.status === 'Completed' ? 'bg-green-500' :
                                    project.status === 'On Hold' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}></div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2 truncate" title={project.title}>{project.title}</h2>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">{project.description}</p>

                            {project.deadline && (
                                <div className="flex items-center text-xs text-gray-400 mb-3">
                                    <Calendar size={12} className="mr-1" />
                                    Due: {new Date(project.deadline).toLocaleDateString()}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                        project.status === 'On Hold' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {project.status}
                                </span>
                                <span className="text-gray-500 text-sm">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${project.status === 'Completed' ? 'bg-green-500' :
                                            project.status === 'On Hold' ? 'bg-orange-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800">Create New Project</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.progress}
                                            onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Project;
