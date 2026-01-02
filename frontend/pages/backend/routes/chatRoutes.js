import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 1. GET CONVERSATIONS (List of people I have chatted with)
router.get('/conversations', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages where I am sender OR receiver
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        // Extract unique contact IDs
        const contactIds = new Set();
        messages.forEach(msg => {
            const otherId = msg.senderId.toString() === userId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString();
            contactIds.add(otherId);
        });

        // Fetch User Details for these contacts
        const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
            .select('name email role mobile');

        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET MESSAGES WITH A SPECIFIC USER
router.get('/:contactId', protect, async (req, res) => {
    try {
        const myId = req.user._id;
        const otherId = req.params.contactId;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. SEND MESSAGE
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, content, studentId } = req.body;

        const newMessage = new Message({
            senderId: req.user._id,
            receiverId,
            content,
            studentId
        });

        await newMessage.save();

        // Real-time Socket Event
        if (req.io) {
            req.io.to(receiverId).emit('new_message', newMessage); // Requires socket joined to room=userId

            // Fallback: Emit to everyone (filtered by client) or specific room logic
            req.io.emit('chat_message', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. HELPER: FIND PARENT FOR A STUDENT (For Teachers to start chat)
router.get('/parent/:studentId', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Find user with matching phone (Parent)
        const parent = await User.findOne({ mobile: student.parentPhone, role: 'PARENT' });

        if (!parent) return res.status(404).json({ error: "Parent not registered yet" });

        res.json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
