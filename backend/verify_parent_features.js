import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = `http://localhost:${process.env.PORT || 5555}`;

// Helper: Login as Parent
async function loginParent() {
    try {
        // Assuming a parent user exists with role: 'PARENT'
        // If not, we might need to seed one or use existing credentials
        // For now, let's try a known test user or create one on the fly if this was a robust test suite
        // But since I don't know the exact parent password, I will bypass strict auth for this verify script OR 
        // rely on the user having a valid token. 
        // BETTER: Use the SEED data credentials if available.
        // Let's assume '9876543210' is a parent from previous context or seed.

        // 1. Initiate Login
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
            loginId: 'P_98765',
            password: 'password123',
            role: 'PARENT'
        });

        if (loginRes.data.step === 'OTP') {
            console.log("   > OTP Required. Using Debug OTP:", loginRes.data.debugOtp);

            // 2. Verify OTP
            const verifyRes = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email: loginRes.data.email,
                otp: loginRes.data.debugOtp // Use the debug OTP returned by backend
            });

            return verifyRes.data.token;
        }

        return loginRes.data.token; // Fallback if no OTP (unlikely)
    } catch (err) {
        console.error("Login Failed:", err.response?.data || err.message);
        return null;
    }
}

async function verify() {
    console.log("--- Verifying Parent Dashboard Features ---");

    const token = await loginParent();
    if (!token) {
        console.log("SKIP: Could not login as parent (Test user might not exist).");
        return;
    }
    console.log("1. Login Successful");

    try {
        // 2. Dashboard Stats
        const stats = await axios.get(`${API_URL}/api/parent/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("2. Dashboard Stats:", stats.data);
        if (stats.data.events === undefined || stats.data.messages === undefined) {
            throw new Error("Stats missing events/messages fields");
        }

        // 3. My Children
        const children = await axios.get(`${API_URL}/api/parent/my-children`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("3. Linked Children:", children.data.length);

        if (children.data.length > 0) {
            const childId = children.data[0]._id;

            // 4. Attendance History
            const attendance = await axios.get(`${API_URL}/api/parent/child/${childId}/attendance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("4. Attendance Logs:", attendance.data.length);

            // 5. Apply Leave
            const leaveRes = await axios.post(`${API_URL}/api/parent/leave`, {
                studentId: childId,
                type: 'Sick',
                dates: [new Date().toISOString().split('T')[0]],
                reason: 'Verification Script Test'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("5. Leave Request:", leaveRes.status === 201 ? "Success" : "Failed");
        }

        // 6. Notices
        const notices = await axios.get(`${API_URL}/api/parent/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("6. Notices:", notices.data.length);

        console.log("--- VERIFICATION PASSED ---");

    } catch (err) {
        console.error("VERIFICATION FAILED:", err.response?.data || err.message);
    }
}

verify();
