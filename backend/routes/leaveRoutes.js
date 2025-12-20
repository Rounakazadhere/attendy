import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// 1. Apply for Leave
router.post('/apply', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'TEACHER', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        const { type, dates, reason } = req.body;
        const newLeave = new Leave({
            applicantId: req.user.id,
            type,
            dates,
            reason
        });
        await newLeave.save();
        res.status(201).json(newLeave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Get My Leaves (For Staff/Teacher)
router.get('/my-leaves', protect, async (req, res) => {
    try {
        const leaves = await Leave.find({ applicantId: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Pending Leaves (For Principal/Admin)
// 3. Get Pending Leaves (For Principal - School Scoped)
router.get('/pending', protect, authorize('ADMIN', 'PRINCIPAL', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        let query = { status: 'Pending' };

        // If Principal/Headmaster, filter by their School
        // 1. Find all users in this school
        if (req.user.role === 'PRINCIPAL' || req.user.role === 'HEADMASTER') {
            const schoolStaff = await User.find({ schoolId: req.user.schoolId }).select('_id');
            const staffIds = schoolStaff.map(u => u._id);
            query.applicantId = { $in: staffIds };
        }

        const leaves = await Leave.find(query)
            .populate('applicantId', 'name email assignedClass role')
            .sort({ createdAt: 1 });

        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Approve/Reject Leave
router.put('/:id/status', protect, authorize('ADMIN', 'PRINCIPAL', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body; // status: 'Approved' or 'Rejected'
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            {
                status,
                approverId: req.user.id,
                rejectionReason: status === 'Rejected' ? rejectionReason : undefined
            },
            { new: true }
        );
        res.json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
