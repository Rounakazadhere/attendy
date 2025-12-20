import express from 'express';
import Class from '../models/Class.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// 1. GET ALL CLASSES (Protected, but open to all authenticated users)
router.get('/', protect, async (req, res) => {
    try {
        // Sort specifically: 5A, 5B, 6A, 10A (Logic requires handling numbers and letters)
        // For simplicity in database sort, we depend on insertion order or simple string sort
        // Better implementation: custom sort in JS
        const classes = await Class.find({}).sort({ grade: 1, section: 1 });

        // Custom sort to handle "10" coming after "5" properly
        classes.sort((a, b) => {
            return parseInt(a.grade) - parseInt(b.grade) || a.section.localeCompare(b.section);
        });

        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. SEED INITIAL CLASSES (Helper) - Admin Only
router.post('/seed', protect, authorize('STATE_ADMIN', 'DISTRICT_ADMIN', 'BLOCK_ADMIN', 'VILLAGE_ADMIN'), async (req, res) => {
    try {
        const seedData = [
            { grade: "1", section: "A" }, { grade: "1", section: "B" },
            { grade: "2", section: "A" }, { grade: "2", section: "B" },
            { grade: "3", section: "A" }, { grade: "3", section: "B" },
            { grade: "4", section: "A" }, { grade: "4", section: "B" },
            { grade: "5", section: "A" }, { grade: "5", section: "B" },
            { grade: "6", section: "A" }, { grade: "6", section: "B" },
            { grade: "7", section: "A" }, { grade: "7", section: "B" },
            { grade: "8", section: "A" }, { grade: "8", section: "B" },
            { grade: "9", section: "A" }, { grade: "9", section: "B" },
            { grade: "10", section: "A" }, { grade: "10", section: "B" },
        ];

        // Upsert logic to avoid duplicates
        const operations = seedData.map(cls => ({
            updateOne: {
                filter: { grade: cls.grade, section: cls.section },
                update: { $set: cls },
                upsert: true
            }
        }));

        await Class.bulkWrite(operations);
        res.json({ message: "Classes Seeded Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
