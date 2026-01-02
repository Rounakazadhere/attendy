import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';
import Student from '../models/Student.js';

const router = express.Router();

// Middleware: All routes here are strictly for PARENTS
router.use(protect);
router.use(authorize('PARENT'));

// GET /api/parent/my-children
router.get('/my-children', async (req, res) => {
    try {
        let students = [];

        // 1. If parent has explicitly linked children IDs
        if (req.user.childrenIds && req.user.childrenIds.length > 0) {
            students = await Student.find({ _id: { $in: req.user.childrenIds } });
        }

        // 2. Auto-link logic: Find students with matching parent phone
        const linkedByPhone = await Student.find({ parentPhone: req.user.mobile });

        // Merge and deduplicate
        const allStudents = [...students, ...linkedByPhone];
        const uniqueStudents = Array.from(new Set(allStudents.map(s => s._id.toString())))
            .map(id => allStudents.find(s => s._id.toString() === id));

        // ENRICH WITH ATTENDANCE STATS
        const enrichedStudents = await Promise.all(uniqueStudents.map(async (student) => {
            const totalDays = await Attendance.countDocuments({ studentId: student._id });
            const presentDays = await Attendance.countDocuments({ studentId: student._id, status: 'Present' });

            let percentage = 0;
            if (totalDays > 0) {
                percentage = Math.round((presentDays / totalDays) * 100);
            } else {
                percentage = 100; // Default if no data, or maybe "N/A"
            }

            return {
                ...student.toObject(),
                currentAttendancePercentage: percentage // Dynamic Override
            };
        }));

        res.json(enrichedStudents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

import Attendance from '../models/Attendance.js';
import Notice from '../models/Notice.js';
import Leave from '../models/Leave.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';

// GET /api/parent/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const noticeCount = await Notice.countDocuments({ targetAudience: { $in: ['ALL', 'PARENTS'] } });

        // Count future events
        const eventCount = await Event.countDocuments({
            date: { $gte: new Date() },
            audience: { $in: ['ALL', 'PARENTS'] }
        });

        // Count messages where I am receiver
        const messageCount = await Message.countDocuments({ receiverId: req.user._id });

        res.json({
            notices: noticeCount,
            events: eventCount,
            messages: messageCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/parent/child/:studentId/attendance
router.get('/child/:studentId/attendance', async (req, res) => {
    try {
        // Validation: Verify this child belongs to the parent (security)
        // For MVP, assuming frontend sends correct ID from /my-children list
        // In Prod, stricter check needed against req.user children list

        const { month, year } = req.query; // e.g., ?month=12&year=2024

        let query = { studentId: req.params.studentId };

        if (month && year) {
            //Regex for YYYY-MM
            const monthStr = month.toString().padStart(2, '0');
            query.date = { $regex: `^${year}-${monthStr}` };
        }

        const logs = await Attendance.find(query).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/parent/notices
router.get('/notices', async (req, res) => {
    try {
        const notices = await Notice.find({
            targetAudience: { $in: ['ALL', 'PARENTS'] }
        }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/parent/leave
router.post('/leave', async (req, res) => {
    try {
        const { studentId, type, dates, reason } = req.body;

        const newLeave = new Leave({
            applicantId: req.user._id,
            studentId, // Link to child
            type,
            dates, // ["YYYY-MM-DD"...]
            reason,
            status: 'Pending'
        });

        await newLeave.save();
        res.status(201).json(newLeave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
