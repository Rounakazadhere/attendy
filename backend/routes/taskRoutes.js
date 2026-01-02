import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get Tasks (filtered by role or user)
router.get('/', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN'), async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        // Normalize Roles for visibility
        const allowedRoles = [role];
        if (role.includes('ADMIN')) allowedRoles.push('ADMIN');
        if (role === 'STATE_ADMIN') allowedRoles.push('ADMIN'); // Explicit
        if (role === 'STAFF') allowedRoles.push('TEACHER');
        if (role === 'TEACHER') allowedRoles.push('STAFF');

        // Find tasks assigned to this user OR assigned to their role(s)
        const tasks = await Task.find({
            $or: [
                { assignedToUser: userId },
                { assignedToRole: { $in: allowedRoles } }
            ]
        }).sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Task (Principal and Staff can create)
router.post('/', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        const { title, description, category, priority, dueDate, assignedToRole, assignedToUser, details } = req.body;
        const newTask = new Task({
            title, description, category, priority, dueDate, assignedToRole, assignedToUser, details,
            createdBy: req.user.id
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Single Task
router.get('/:id', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Status
router.patch('/:id/toggle', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Delete Task
router.delete('/:id', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'HEADMASTER'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Authorization Check: Only Creator or Admin can delete
        if (task.createdBy.toString() !== req.user.id && !['ADMIN', 'PRINCIPAL'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized to delete this task' });
        }

        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
