import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import config from '../src/config';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { UserPlus, X, Save } from 'lucide-react';

const AddStudent = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);

    // Get User for Layout
    const [user, setUser] = useState(null);
    useEffect(() => {
        const u = localStorage.getItem('user');
        const t = localStorage.getItem('token');
        console.log("Current Auth State:", { user: u, token: t });
        if (u) setUser(JSON.parse(u));
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        classSection: '', // User must select
        parentPhone: ''
    });

    const [classes, setClasses] = useState([]);

    // Fetch Classes on Mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // In a real app we might fetch classes from API
                // For now, let's just mock a standard set of classes or use what we had if API exists
                // We'll trust the existing API endpoint if it works, or fallback to simple options
                const res = await axios.get(`${config.API_URL}/api/classes`);
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to fetch classes, using defaults", err);
                // Fallback defaults for demo
                const defaults = [];
                for (let i = 1; i <= 10; i++) {
                    ['A', 'B'].forEach(s => defaults.push({ _id: `${i}${s}`, fullName: `${i}${s}`, grade: i, section: s }));
                }
                setClasses(defaults);
            }
        };
        fetchClasses();

        // Animation
        gsap.fromTo(formRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
        );
    }, []);

    // Check for Edit Mode
    const { id } = useParams();
    const isEditMode = !!id;

    // Fetch Student for Edit
    useEffect(() => {
        if (isEditMode) {
            const fetchStudent = async () => {
                try {
                    const res = await axios.get(`${config.API_URL}/api/students/details/${id}`);
                    setFormData({
                        name: res.data.name,
                        rollNumber: res.data.rollNumber,
                        classSection: res.data.classSection,
                        parentPhone: res.data.parentPhone
                    });
                } catch (err) {
                    console.error("Failed to fetch student details", err);
                    alert("Failed to load student for editing");
                    navigate('/manage-students');
                }
            };
            fetchStudent();
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [successCreds, setSuccessCreds] = useState(null); // { loginId, password }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        console.log("👉 Submitting Student. Token:", token ? "Exists" : "MISSING", token);

        try {
            if (isEditMode) {
                await axios.put(`${config.API_URL}/api/students/${id}`, formData);
                alert("Student Updated Successfully!");
                navigate('/manage-students');
            } else {
                const res = await axios.post(`${config.API_URL}/api/students`, formData);
                if (res.data.parentCredentials && res.data.parentCredentials.password !== "(Use Existing)") {
                    setSuccessCreds(res.data.parentCredentials);
                } else {
                    alert("Student Added Successfully!");
                    navigate('/manage-students');
                }
            }
        } catch (err) {
            console.error("❌ Add Student Error:", err);
            alert(err.response?.data?.error || "Error saving student.");
        }
    };

    if (successCreds) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Added!</h2>
                    <p className="text-gray-500 mb-6 font-medium">Share these with the Parent</p>

                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 text-left">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Parent Login ID</p>
                        <p className="text-2xl font-mono font-bold text-blue-600">{successCreds.loginId}</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-6 text-left">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Parent Password</p>
                        <p className="text-2xl font-mono font-bold text-green-600">{successCreds.password}</p>
                    </div>

                    <button
                        onClick={() => navigate('/manage-students')}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout user={user} title={isEditMode ? "Edit Student" : "Add New Student"} subtitle={isEditMode ? "Modify student details" : "Enroll a new student to the class"}>
            <div className="flex justify-center">
                <div ref={formRef} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-2xl">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? "Edit Profile" : "Student Details"}</h2>
                            <p className="text-gray-500 text-sm">{isEditMode ? "Update the information below." : "Enter the information below to create a new profile."}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Student Name</label>
                                <input
                                    type="text" name="name" required
                                    placeholder="e.g. Rahul Kumar"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Roll Number */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Roll Number</label>
                                <input
                                    type="text" name="rollNumber" required
                                    placeholder="e.g. 21"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Class Section */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Class & Section</label>
                                <select
                                    name="classSection" required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
                                    onChange={handleChange}
                                    value={formData.classSection}
                                >
                                    <option value="" disabled>Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls.fullName}>
                                            Class {cls.grade}{cls.section}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Parent Phone */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Parent Phone</label>
                                <input
                                    type="tel" name="parentPhone" required
                                    placeholder="e.g. 9876543210"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4 border-t border-gray-100 mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/attendance')}
                                className="flex-1 p-4 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition border border-gray-200 flex items-center justify-center gap-2"
                            >
                                <X size={20} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                Save Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddStudent;