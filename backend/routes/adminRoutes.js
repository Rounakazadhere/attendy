import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import ClassLog from '../models/ClassLog.js';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Middleware: All admin routes require authentication and admin/principal role
// Using 'STATE_ADMIN' etc as per User Schema, or allowing Principal to manage some aspects
router.use(protect);
router.use(authorize('ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'PRINCIPAL'));

// POST /api/admin/create-user
// Only for creating Principal, Parent, or Teacher accounts by Admin
router.post('/create-user', async (req, res) => {
    try {
        const { name, email, password, role, childrenIds, assignedClass } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Validation for specific roles
        if (role === 'PARENT') {
            if (!childrenIds || childrenIds.length === 0) {
                return res.status(400).json({ message: 'Parent account must be linked to at least one Student ID.' });
            }
            // Verify students exist
            const students = await Student.find({ _id: { $in: childrenIds } });
            if (students.length !== childrenIds.length) {
                return res.status(400).json({ message: 'One or more Student IDs are invalid.' });
            }
        }

        if (role === 'STAFF' && !assignedClass) {
            // Not strictly required but good practice to warn or require
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            childrenIds: role === 'PARENT' ? childrenIds : [],
            assignedClass: role === 'STAFF' ? assignedClass : undefined
        });

        res.status(201).json({ message: `${role} created successfully`, user: { id: newUser._id, email: newUser.email, role: newUser.role } });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});


// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await User.countDocuments({ role: 'STAFF' }); // Use 'STAFF' as per model enum

        // Calculate Attendance Percentage based on Student Status (Snapshot of "Today")
        const presentCount = await Student.countDocuments({ status: 'Present' });
        const avgAttendance = totalStudents > 0
            ? Math.round((presentCount / totalStudents) * 100)
            : 0;

        // Mock Data specifically for Principal view where we might not have 'Schools' concept fully fleshed out per user yet
        // But let's assume this user is a Principal of ONE school.
        const totalClasses = 12; // Placeholder or count types of class sections

        res.json({
            totalSchools: 1, // Single school view
            totalClasses,
            totalStudents,
            totalTeachers,
            activeStaff: totalTeachers,
            avgAttendance,
            presentToday: presentCount,
            absentToday: totalStudents - presentCount,
            alerts: 5
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/admin/class-performance
router.get('/class-performance', async (req, res) => {
    try {
        // Aggregate to find total students per class
        const studentsPerClass = await Student.aggregate([
            { $group: { _id: "$classSection", total: { $sum: 1 } } }
        ]);

        // Aggregate to find present students per class (Current Status snapshot)
        const presentPerClass = await Student.aggregate([
            { $match: { status: "Present" } },
            { $group: { _id: "$classSection", present: { $sum: 1 } } }
        ]);

        // Merge results
        const performance = studentsPerClass.map(cls => {
            const presentData = presentPerClass.find(p => p._id === cls._id);
            const present = presentData ? presentData.present : 0;
            const percentage = cls.total > 0 ? Math.round((present / cls.total) * 100) : 0;
            return {
                className: cls._id,
                total: cls.total,
                present,
                percentage
            };
        });

        // Sort by Class Name alphanumeric (simple sort)
        performance.sort((a, b) => a.className.localeCompare(b.className));

        res.json(performance);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/admin/teacher-activity
router.get('/teacher-activity', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Get all Teachers
        const teachers = await User.find({ role: 'STAFF' }).select('name email assignedClass');

        // 2. Get all Attendance records for today (distinct by markedBy)
        const attendanceRecords = await Attendance.find({ date: today }).distinct('markedBy');

        // 3. Check Class Logs
        const logRecords = await ClassLog.find({ date: today }).distinct('teacherId');

        // Fix: safe conversion to string
        const activeTeacherIds = new Set();
        const safeAdd = (id) => { if (id) activeTeacherIds.add(id.toString()); };

        attendanceRecords.forEach(safeAdd);
        logRecords.forEach(safeAdd);

        const activity = teachers.map(t => ({
            _id: t._id,
            name: t.name,
            assignedClass: t.assignedClass,
            status: activeTeacherIds.has(t._id.toString()) ? "Submitted" : "Pending",
            time: activeTeacherIds.has(t._id.toString()) ? "Today" : "-"
        }));

        res.json(activity);
    } catch (e) {
        console.error("Error in teacher-activity:", e);
        res.status(500).json({ error: "Server Error", details: e.message });
    }
});

export default router;
