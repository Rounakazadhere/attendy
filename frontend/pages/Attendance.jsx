import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import gsap from 'gsap';
import config from '../src/config';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Save, UserPlus, Trash2, CheckCircle, XCircle } from 'lucide-react';

// Connect to Backend
const socket = io(config.API_URL);

const Attendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tableRef = useRef(null);

  // Get User from Storage for Layout
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  // --- STATE ---
  const [students, setStudents] = useState([]);

  // Class Selection (Auto-fill from Dashboard if passed)
  const initialClass = location.state?.classId || "5A";
  const [className, setClassName] = useState(initialClass.slice(0, -1) || "5"); // "5"
  const [section, setSection] = useState(initialClass.slice(-1) || "A");   // "A"

  const currentClassId = `${className}${section}`; // E.g., "5A"

  // Teaching Log
  const [subject, setSubject] = useState("Maths");
  const [topic, setTopic] = useState("");
  const [logSaved, setLogSaved] = useState(false);

  // --- EFFECTS ---

  // 1. Fetch Students & Logs when Class/Section Changes
  useEffect(() => {
    fetchStudents();
    fetchTodayLog();
  }, [currentClassId]); // Re-run when "5A" becomes "6B"

  // Socket Listener
  useEffect(() => {
    socket.on('attendance_update', (data) => {
      setStudents(prev => prev.map(s =>
        s._id === data.studentId ? { ...s, status: data.status } : s
      ));
    });

    socket.on('student_deleted', (data) => {
      setStudents(prev => prev.filter(s => s._id !== data.studentId));
    });

    return () => {
      socket.off('attendance_update');
      socket.off('student_deleted');
    };
  }, []);

  // GSAP Entrance
  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(tableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentClassId]); // Re-animate on class switch


  // --- API CALLS ---

  const fetchStudents = async () => {
    try {
      // Dynamic Endpoint based on Selection
      const res = await axios.get(`${config.API_URL}/api/students/${currentClassId}`);
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students");
    }
  };

  const fetchTodayLog = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/api/students/log/${currentClassId}`);
      // If log exists for this subject, pre-fill it
      const existing = res.data.find(l => l.subject === subject);
      if (existing) {
        setTopic(existing.topic);
        setLogSaved(true);
      } else {
        setTopic("");
        setLogSaved(false);
      }
    } catch (err) {
      console.error("Log fetch error", err);
    }
  };

  const saveLog = async () => {
    const userObj = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!userObj || !token) return alert("Login required to save log");

    try {
      await axios.post(`${config.API_URL}/api/students/log`, {
        teacherId: userObj._id || userObj.id, // Handle potential id diffs
        classSection: currentClassId,
        subject,
        topic,
        date: new Date().toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogSaved(true);
      // alert("✅ Topic Logged Successfully!");
    } catch (err) {
      alert("Failed to save log");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Present" ? "Absent" : "Present";
    setStudents(prev => prev.map(s => s._id === id ? { ...s, status: newStatus } : s)); // Optimistic

    try {
      const userObj = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      await axios.post(`${config.API_URL}/api/students/attendance`, { // Fixed endpoint path to match backend
        studentId: id,
        status: newStatus,
        markedBy: userObj?._id || userObj?.id // Safety check
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      alert("Sync failed! Check internet.");
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Delete this student?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_URL}/api/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  return (
    <DashboardLayout user={user} title="Attendance Register" subtitle={`Managing Class ${currentClassId}`}>
      <div className="space-y-6">

        {/* 1. TOP CONTROLS: Class Selector & Daily Log */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

          {/* Class Selector */}
          <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="bg-white text-gray-800 p-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 font-bold"
              >
                {[...Array(10)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="bg-white text-gray-800 p-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 font-bold"
              >
                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Daily Teaching Log */}
          <div className="flex-1 w-full md:w-auto bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-3 items-end">
            <div className="w-full md:w-32">
              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setLogSaved(false); }}
                className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-200 outline-none text-sm font-medium"
              >
                {['Maths', 'Science', 'English', 'History', 'Hindi'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">Topic Taught</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setLogSaved(false); }}
                placeholder="e.g. Algebra Chapter 2"
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-800 outline-none focus:border-green-500 text-sm placeholder-gray-400"
              />
            </div>
            <button
              onClick={saveLog}
              className={`px-4 py-2 rounded-lg font-bold text-sm shadow transition flex items-center gap-2 ${logSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <Save size={16} />
              {logSaved ? "Saved" : "Save Log"}
            </button>
          </div>
        </div>

        {/* 2. MAIN REGISTER */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Student Register</h2>
              <p className="text-gray-500 text-sm">Tap status to toggle Present/Absent</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-blue-600">
                {students.filter(s => s.status === "Present").length} <span className="text-lg text-gray-400 font-normal">/ {students.length}</span>
              </span>
              <span className="text-xs uppercase tracking-wide text-gray-400 font-bold">Present Today</span>
            </div>
          </div>

          {/* Student List */}
          <div className="p-0" ref={tableRef}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Roll No</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-500/10">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id} className="hover:bg-blue-50/50 transition duration-150">
                        <td className="py-4 px-6 text-gray-500 font-medium font-mono">{student.rollNumber}</td>
                        <td className="py-4 px-6 text-gray-800 font-bold text-lg">{student.name}</td>

                        {/* Status Button */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toggleStatus(student._id, student.status)}
                            className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all duration-200 w-32 flex items-center justify-center gap-2 mx-auto ${student.status === "Present"
                              ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                              : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                              }`}
                          >
                            {student.status === "Present" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {student.status || 'Pending'}
                          </button>
                        </td>

                        {/* Delete Button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => deleteStudent(student._id)}
                            className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
                            title="Delete Student"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-20">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <UserPlus size={40} />
                          </div>
                          <p className="text-lg font-medium text-gray-600">No Students Found in Class {currentClassId}</p>
                          <p className="text-sm">Add students to start taking attendance</p>
                          <button
                            onClick={() => navigate('/add-student')}
                            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
                          >
                            <UserPlus size={20} />
                            Add New Student
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;