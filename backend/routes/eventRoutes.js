import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 1. CREATE EVENT (Protected)
router.post('/', protect, async (req, res) => {
    try {
        const newEvent = new Event({
            ...req.body,
            createdBy: req.user._id
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. LIST EVENTS (For Dashboard)
router.get('/list', async (req, res) => {
    try {
        // Simple filter logic could go here
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
