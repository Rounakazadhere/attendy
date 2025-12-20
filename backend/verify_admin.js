
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.loadEnvFile(path.join(__dirname, '.env'));

const API_URL = 'http://localhost:5555/api';
const SECRET_CODE = "ADM@2025"; // Admin Secret from .env

const run = async () => {
    try {
        console.log("--- 1. LOGIN AS ADMIN ---");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            claimedRole: 'STATE_ADMIN',
            email: 'admin@test.com',
            password: 'password123',
            secretCode: SECRET_CODE
        });

        console.log("✅ Login Initiated (OTP Sent)");

        console.log("--- 1.5 VERIFY OTP ---");
        const otpRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            email: 'admin@test.com',
            otp: '123456'
        });

        const TOKEN = otpRes.data.token;
        const USER = otpRes.data.user;
        console.log(`✅ Admin Logged In: ${USER.email} (${USER.role})`);

        console.log("\n--- 2. GET ADMIN STATS (GET /api/admin/stats) ---");
        const statsRes = await axios.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log("✅ Stats Received:", statsRes.data);

    } catch (err) {
        console.error("❌ ERROR:", err.message);
        if (err.response) {
            console.error("Response:", err.response.data);
            console.error("Status:", err.response.status);
        }
    }
};

run();
