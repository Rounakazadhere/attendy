import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import User from './models/User.js';

dotenv.config();

// Simple verification script to simulate finding and deleting a task
async function verifyDelete() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/rural-attendance");
        console.log("✅ Custom Seed: Connected to MongoDB");

        // 1. Create a Dummy Task
        const admin = await User.findOne({ role: 'PRINCIPAL' });
        if (!admin) {
            console.log("No Principal found to create task.");
            process.exit(0);
        }

        const newTask = new Task({
            title: "To Be Deleted",
            description: "Test delete functionality",
            category: "General",
            priority: "Low",
            createdBy: admin._id,
            assignedToRole: 'STAFF'
        });
        await newTask.save();
        console.log(`Task Created: ${newTask._id}`);

        // 2. Delete it (Simulate Backend Logic)
        const taskToDelete = await Task.findById(newTask._id);
        if (taskToDelete) {
            await taskToDelete.deleteOne();
            console.log("✅ Task Deleted Successfully via Mongoose");
        } else {
            console.log("❌ Task not found for deletion");
        }

        process.exit(0);

    } catch (err) {
        console.error("❌ Verification Failed:", err);
        process.exit(1);
    }
}

verifyDelete();
