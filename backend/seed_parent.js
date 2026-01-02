import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Student from './models/Student.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_app';

const seedParent = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');

        // 1. Create Parent
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const parentEmail = 'parent.demo@test.com';
        // Cleanup old test data
        await User.deleteOne({ email: parentEmail });
        await Student.deleteOne({ admissionNumber: 'DEMO-CHILD-001' });

        const parent = new User({
            name: 'Demo Parent',
            email: parentEmail,
            password: 'password123', // Pre-save hook will hash this
            role: 'PARENT',
            mobile: '9876543210',
            employeeId: 'P_98765' // Mock ID
        });
        await parent.save();
        console.log('👤 Parent Created:', parent.email);

        // 2. Create Student
        const student = new Student({
            name: 'Demo Child',
            rollNumber: 'ROLL-101',
            classSection: '10-A',
            parentPhone: '9876543210', // Matches parent
            parentEmail: parentEmail,
            admissionNumber: 'DEMO-CHILD-001'
        });
        await student.save();
        console.log('🎓 Student Created:', student.name);

        console.log('✅ Seeding Complete');
        process.exit();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

seedParent();
