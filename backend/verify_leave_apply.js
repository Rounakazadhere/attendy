
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.loadEnvFile(path.join(__dirname, '.env'));

const API_URL = 'http://localhost:5555/api';

const run = async () => {
    try {
        console.log("--- LOGIN AS STAFF (teacher@test.com) ---");
        const otpRes = await axios.post(`${API_URL}/auth/login`, {
            claimedRole: 'STAFF',
            email: 'teacher@test.com',
            password: 'password123',
            secretCode: 'TEA@2025'
        });

        const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            email: 'teacher@test.com',
            otp: '123456'
        });
        const token = verifyRes.data.token;
        console.log(`✅ Logged in.`);

        console.log("--- APPLYING FOR LEAVE ---");
        const payload = {
            type: 'Sick',
            dates: ['2025-12-25', ''], // Array with empty string (Frontend behavior?)
            reason: 'Feeling unwell'
        };

        const applyRes = await axios.post(`${API_URL}/leave/apply`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ Leave Applied Successfully:", applyRes.data._id);
        console.log("Data:", applyRes.data);

    } catch (err) {
        console.error("❌ ERROR:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Response Data:", err.response.data);
        }
    }
};

run();
