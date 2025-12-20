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

        res.json(uniqueStudents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/parent/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
    // Mock stats or aggregated data for the parent dashboard
    res.json({
        notices: 2,
        events: 1,
        messages: 0
    });
});

export default router;
