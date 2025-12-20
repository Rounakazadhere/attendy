import express from 'express';
import Notice from '../models/Notice.js';

const router = express.Router();

// 1. CREATE NOTICE
router.post('/create', async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();

        // Future: Send Push Notifications via FCM

        res.status(201).json(newNotice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. LIST ALL NOTICES
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

// 3. DELETE NOTICE
router.delete('/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
