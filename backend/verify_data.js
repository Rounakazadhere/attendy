import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import User from './models/User.js';

dotenv.config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/rural-attendance");
        console.log("✅ Custom Seed: Connected to MongoDB");

        const studentCount = await Student.countDocuments();
        console.log(`Total Students: ${studentCount}`);

        const sampleStudent = await Student.findOne();
        console.log("Sample Student:", sampleStudent);

        const parentCount = await User.countDocuments({ role: 'PARENT' });
        console.log(`Total Parents: ${parentCount}`);

        const staffCount = await User.countDocuments({ role: 'STAFF' });
        console.log(`Total Staff: ${staffCount}`);

        const teacherCount = await User.countDocuments({ role: 'TEACHER' });
        console.log(`Total Teacher Role (if any): ${teacherCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
