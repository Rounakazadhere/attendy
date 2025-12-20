import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// 1. GET SUMMARY STATS (Today)
router.get('/summary', async (req, res) => {
    try {
        const todaySearch = new RegExp(new Date().toISOString().split('T')[0]);

        // Student Stats
        // Note: Ideally use StudentAttendance for daily tracking, but using Student.status for live view as per current system
        const totalStudents = await Student.countDocuments();
        const presentStudents = await Student.countDocuments({ status: "Present" }); // Case sensitive check needed
        const studentPercentage = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : 0;

        // Teacher Stats
        const totalTeachers = await User.countDocuments({ role: 'STAFF' });
        const presentTeachers = await Attendance.countDocuments({ date: { $regex: todaySearch }, status: 'PRESENT' });

        // Late Arrivals (Teachers)
        const lateTeachers = await Attendance.countDocuments({ date: { $regex: todaySearch }, status: 'LATE' });

        // Alerts Count
        const activeAlerts = await Alert.countDocuments({ resolved: false });

        res.json({
            studentPercentage,
            presentStudents,
            totalStudents,
            absentStudents: totalStudents - presentStudents,
            teacherStats: {
                present: presentTeachers,
                total: totalTeachers,
                late: lateTeachers
            },
            activeAlerts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET CLASS-WISE OVERVIEW
router.get('/class-wise', async (req, res) => {
    try {
        // Aggregate to group by classSection
        const stats = await Student.aggregate([
            {
                $group: {
                    _id: "$classSection",
                    total: { $sum: 1 },
                    present: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
                        }
                    },
                    absent: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Absent"] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } } // Sort by class name (1A, 1B, etc.)
        ]);

        const formattedStats = stats.map(cls => ({
            className: cls._id,
            total: cls.total,
            present: cls.present,
            absent: cls.absent,
            percentage: cls.total > 0 ? ((cls.present / cls.total) * 100).toFixed(1) : 0
        }));

        res.json(formattedStats);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ALERTS
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find({ resolved: false })
            .populate('studentId', 'name classSection')
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
