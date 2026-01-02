import dotenv from 'dotenv';
dotenv.config();
console.log("\n==================================");
console.log("🚀 STARTING SCHOOL BACKEND SYSTEM");
console.log("==================================");
console.log("DEBUG: Loading Role Secrets...");
console.log(` > PRINCIPAL: ${process.env.SECRET_PRINCIPAL || 'PRI@2025 (Default)'}`);
console.log(` > TEACHER:   ${process.env.SECRET_TEACHER || 'TEA@2025 (Default)'}`);
console.log("==================================\n");
console.log("DEBUG: Environment Variables Keys:", Object.keys(process.env).join(", "));
console.log("==================================\n");
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// Import Route Files
import studentRoutes from './routes/studentRoutes.js';
import authRoutes from './routes/auth.js'; // <--- THIS IS KEY

const app = express();
app.use(cors({
    origin: true, // Allow all origins for debugging
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true // Allow cookies/headers
}));
app.use(express.json());

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for debugging
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]
    }
});

// Middleware: Attach 'io' to every request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- DATABASE CONNECTION ---
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Attendy';
console.log(`DEBUG: Full DB URI: ${DB_URI.replace(/:([^:@]+)@/, ':****@')}`); // Log sanitized URI

mongoose.connect(DB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ CRITICAL DB Error:', err.message);
        console.error('   Checking internet connection and IP whitelist...');
    });

// START SERVER IMMEDIATELY (Don't wait for DB, so we don't get Connection Refused)
const PORT = process.env.PORT || 5555;
server.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);        // Handles /api/auth/...
// --- RESTORED IMPORTS ---
import parentRoutes from './routes/parentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import staffRoutes from './routes/staffAttendance.js';
import classRoutes from './routes/classRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; 
// --- MOUNT ROUTES ---
app.use('/api/students', studentRoutes); // Handles /api/students/...
app.use('/api/auth', authRoutes);        // Handles /api/auth/...
app.use('/api/parent', parentRoutes);
app.use('/api/chat', chatRoutes);        // NEW CHAT ROUTE

// SIH UPGRADE: New Staff Routes
// NEW: Principal Dashboard Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/reports', reportsRoutes);

app.use('/api/staff', staffRoutes);
app.use('/api/classes', classRoutes);

app.use('/api/admin', adminRoutes);

import leaveRoutes from './routes/leaveRoutes.js';
app.use('/api/leave', leaveRoutes); // Changed from /api/leaves to /api/leave for consistency with plan

import projectRoutes from './routes/projectRoutes.js';
app.use('/api/projects', projectRoutes);

import taskRoutes from './routes/taskRoutes.js';
app.use('/api/tasks', taskRoutes);

import eventRoutes from './routes/eventRoutes.js';
app.use('/api/events', eventRoutes);

// SERVE STATIC IMAGES
import path from 'path';
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('✅ Backend is Running Successfully!');
});