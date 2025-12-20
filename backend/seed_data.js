
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import School from './models/School.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Leave from './models/Leave.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
if (fs.existsSync(path.join(__dirname, '.env'))) {
    process.loadEnvFile(path.join(__dirname, '.env'));
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_app';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected for Seeding');

        // Clear existing data (Optional: comment out if you want to keep data)
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Leave.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const users = await User.insertMany([
            {
                name: 'Principal User',
                email: 'principal@test.com',
                password: passwordHash,
                role: 'PRINCIPAL',
                mobile: '1111111111'
            },
            {
                name: 'Teacher User',
                email: 'teacher@test.com',
                password: passwordHash,
                role: 'STAFF',
                mobile: '2222222222'
            },
            {
                name: 'Admin User',
                email: 'admin@test.com',
                password: passwordHash,
                role: 'STATE_ADMIN',
                mobile: '3333333333'
            }
        ]);
        console.log('👥 Users Created');

        const [principal, teacher, admin] = users;

        // Create School
        await School.deleteMany({});
        const school = await School.create({
            name: 'Demo Rural School',
            schoolCode: 'DEMO-1234',
            address: 'Village 1, Bihar',
            admin: principal._id
        });
        console.log('🏫 School Created: DEMO-1234');

        // Link Principal to School
        principal.schoolId = school._id;
        await principal.save();

        // Link Teacher to School
        teacher.schoolId = school._id;
        await teacher.save();

        // Create Projects
        await Project.create([
            {
                title: 'Annual Sports Day',
                description: 'Organize the annual sports event for the school.',
                status: 'Active',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                progress: 20,
                team: [teacher._id],
                createdBy: principal._id
            },
            {
                title: 'Science Exhibition',
                description: 'Setup and manage science fair projects.',
                status: 'Active',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                progress: 45,
                team: [teacher._id, admin._id],
                createdBy: principal._id
            },
            {
                title: 'Website Redesign',
                description: 'Revamp the school website.',
                status: 'Completed',
                deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                progress: 100,
                team: [admin._id],
                createdBy: principal._id
            }
        ]);
        console.log('🚀 Projects Created');

        // Create Tasks
        await Task.create([
            {
                title: 'Submit Lesson Plans',
                description: 'Weekly lesson plans for Class 10.',
                category: 'Academic',
                priority: 'High',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                assignedToRole: 'STAFF',
                details: 'Include physics and chemistry practicals.',
                createdBy: principal._id
            },
            {
                title: 'Review Attendance',
                description: 'Check monthly attendance logs.',
                category: 'Admin',
                priority: 'Medium',
                assignedToRole: 'PRINCIPAL',
                completed: false,
                createdBy: admin._id
            },
            {
                title: 'Prepare Staff Meeting Agenda',
                description: 'Agenda for Friday meeting.',
                category: 'Meeting',
                priority: 'Low',
                assignedToUser: principal._id,
                assignedToRole: 'PRINCIPAL',
                details: 'Topics: Exam schedule, Summer break.',
                createdBy: principal._id
            }
        ]);
        console.log('📋 Tasks Created');

        // Create Leaves
        await Leave.create([
            {
                applicantId: teacher._id,
                type: 'Sick',
                dates: [new Date().toISOString().split('T')[0], new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
                reason: 'Viral Fever',
                status: 'Pending'
            },
            {
                applicantId: teacher._id,
                type: 'Casual',
                dates: [new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
                reason: 'Family function',
                status: 'Approved',
                approverId: principal._id
            }
        ]);
        console.log('✈️ Leaves Created');

        console.log('\n✅ Seed Data Injection Successful!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
};

seedData();
