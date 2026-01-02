// verify_attendance_email.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Student from './models/Student.js';
import User from './models/User.js';

dotenv.config();

async function verifyEmailTrigger() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/rural-attendance");
        console.log("✅ Custom Seed: Connected to MongoDB");

        // 1. Find a Student with a Parent
        const student = await Student.findOne({ parentPhone: { $exists: true } });
        if (!student) {
            console.log("❌ No student with parent phone found.");
            process.exit(1);
        }

        // 2. Ensure Parent User exists and has email
        let parent = await User.findOne({ mobile: student.parentPhone });
        if (!parent) {
            console.log("❌ Parent user not found, creating dummy one...");
            parent = new User({
                name: "Test Parent",
                email: "testparent@gmail.com", // Real-looking email
                mobile: student.parentPhone,
                role: "PARENT",
                password: "password123"
            });
            await parent.save();
        } else if (!parent.email || parent.email.includes("school.com")) {
            parent.email = "testparent@gmail.com";
            await parent.save();
            console.log("✅ Updated Parent Email to testparent@gmail.com");
        }

        console.log(`\n🧪 Testing Attendance Email for Student: ${student.name} (ID: ${student._id})`);
        console.log(`   Parent Email: ${parent.email}`);

        // 3. Find an Admin/Teacher token (Simulated)
        // In a script we can't easily mock auth middleware without a valid token. 
        // BUT we can use the model directly to test the logic if we copy it, 
        // OR we can just login as admin via API. Let's do API call to be integration test.

        // Login as Principal
        console.log("\n🔐 Logging in as Principal...");
        const loginRes = await axios.post('http://localhost:5555/api/auth/login', {
            loginId: 'PRI001', // Corrected field name
            password: process.env.SECRET_PRINCIPAL || 'PRI@2025' // Default
        }).catch(e => e.response);

        if (!loginRes || loginRes.status !== 200) {
            console.log("❌ Login failed. Cannot test API endpoint.");
            console.log("   Reason:", loginRes ? loginRes.data : "Connection Error");
            process.exit(1);
        }

        const debugOtp = loginRes.data.debugOtp;
        const email = loginRes.data.email;
        console.log(`✅ Login Step 1 Logic. Debug OTP: ${debugOtp}`);

        // Verify OTP
        console.log("\n🔐 Verifying OTP...");
        const otpRes = await axios.post('http://localhost:5555/api/auth/verify-otp', {
            email: email,
            otp: debugOtp
        }).catch(e => e.response);

        if (!otpRes || otpRes.status !== 200) {
            console.log("❌ OTP Verification Failed.");
            console.log("   Reason:", otpRes ? otpRes.data : "Connection Error");
            process.exit(1);
        }

        const token = otpRes.data.token;
        const userId = otpRes.data.user._id;
        console.log(`✅ OTP Verified. Token Received. User ID: ${userId}`);

        // 4. Mark Attendance as ABSENT
        console.log("\n📲 Sending 'Absent' status to API...");
        const attendRes = await axios.post('http://localhost:5555/api/students/attendance', {
            studentId: student._id,
            status: 'Absent',
            markedBy: userId // Use real ID
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ API Response:", attendRes.data);
        console.log("\n👉 CHECK SERVER LOGS ABOVE FOR '[EMAIL MOCK]' output.");

        process.exit(0);

    } catch (err) {
        console.error("❌ Verification Failed:", err.message);
        if (err.response) console.error("   API Error:", err.response.data);
        process.exit(1);
    }
}

verifyEmailTrigger();
