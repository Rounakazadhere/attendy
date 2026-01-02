import express from 'express';
import Notice from '../models/Notice.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 1. CREATE NOTICE (Protected)
router.post('/create', protect, async (req, res) => {
    try {
        // Map frontend fields compatibility if needed, or enforce matched schema
        const { title, message, targetAudience, content, audience } = req.body;

        const newNotice = new Notice({
            title,
            message: message || content, // Support both for compatibility
            targetAudience: targetAudience || (audience === 'EVERYONE' ? 'ALL' : audience),
            createdBy: req.user.id // From Token
        });

        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (err) {
        console.error("Notice Create Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// 2. LIST ALL NOTICES (Public or Protected? Let's keep public for now or protected)
router.get('/list', async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. DELETE NOTICE (Protected)
router.delete('/:id', protect, async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
