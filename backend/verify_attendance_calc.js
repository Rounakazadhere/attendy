import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Attendance from './models/Attendance.js';
import User from './models/User.js';
import Student from './models/Student.js';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = `http://localhost:${process.env.PORT || 5555}`;

async function verifyAttendanceCalc() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ DB Connected");

        // 1. Get Parent Token (using seed credentials)
        // Login Flow (simplified directly for token if we had one, but let's use login)
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
            loginId: 'P_98765',
            password: 'password123',
            role: 'PARENT'
        });

        let token = loginRes.data.token;
        if (loginRes.data.step === 'OTP') {
            const verifyRes = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email: loginRes.data.email,
                otp: loginRes.data.debugOtp
            });
            token = verifyRes.data.token;
        }

        // 2. Clear old logs for Demo Child
        const student = await Student.findOne({ admissionNumber: 'DEMO-CHILD-001' });
        if (!student) throw new Error("Student not found");
        await Attendance.deleteMany({ studentId: student._id });

        // 3. Check Initial Percentage (Should be 100% or default)
        let res = await axios.get(`${API_URL}/api/parent/my-children`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Initial Percentage:", res.data[0].currentAttendancePercentage + "%");

        // 4. Add 1 Present, 1 Absent
        // Fetch a dummy class and user or use ObjectId
        const dummyId = new mongoose.Types.ObjectId();
        await Attendance.create([
            { studentId: student._id, date: '2024-01-01', status: 'Present', markedBy: dummyId, classId: dummyId },
            { studentId: student._id, date: '2024-01-02', status: 'Absent', markedBy: dummyId, classId: dummyId }
        ]);
        console.log("Added 1 Present, 1 Absent log.");

        // 5. Check Percentage (Should be 50%)
        res = await axios.get(`${API_URL}/api/parent/my-children`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Calculated Percentage:", res.data[0].currentAttendancePercentage + "%");

        if (res.data[0].currentAttendancePercentage === 50) {
            console.log("✅ SUCCESS: Calculation is correct.");
        } else {
            console.error("❌ FAILURE: Expected 50%.");
        }

        process.exit();

    } catch (err) {
        console.error("ERROR:", err.message);
        process.exit(1);
    }
}

verifyAttendanceCalc();
