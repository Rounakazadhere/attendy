import express from 'express';
// Note: PDF/Excel generation usually happens on Backend if complex, or Frontend if simple data dump.
// For "Government-Ready", Backend generation is often better for formatting (headers/logos).
// But for MERN speed, Frontend generation (jsPDF) is often preferred.
// Here we provide the DATA endpoints optimized for reporting.

import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const router = express.Router();

// 1. CLASS REPORT DATA
router.get('/class/:classSection', async (req, res) => {
    try {
        const students = await Student.find({ classSection: req.params.classSection });
        // In real app, join with StudentAttendance for date range. 
        // Returning student list for now.
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. TEACHER REPORT DATA
router.get('/teachers', async (req, res) => {
    try {
        // Return teacher attendance summary for last 30 days
        const teachers = await User.find({ role: 'STAFF' }).select('name employeeId');

        // This would be a heavy query in production.
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
