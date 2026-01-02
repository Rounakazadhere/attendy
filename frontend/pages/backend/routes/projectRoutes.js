import express from 'express';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get all projects (Accessible by Staff and Principal)
router.get('/', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN'), async (req, res) => {
    try {
        const projects = await Project.find().populate('team', 'name email').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Project (Principal Only)
router.post('/', protect, authorize('PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    try {
        const { title, description, deadline, team } = req.body;
        const newProject = new Project({
            title,
            description,
            deadline,
            team: team || [],
            createdBy: req.user.id
        });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update Project (Principal Only)
router.put('/:id', protect, authorize('PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Project (Principal Only)
router.delete('/:id', protect, authorize('PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
