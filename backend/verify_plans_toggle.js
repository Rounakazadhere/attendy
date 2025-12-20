
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
        console.log("--- LOGIN AS ADMIN (admin@test.com) ---");
        const otpRes = await axios.post(`${API_URL}/auth/login`, {
            claimedRole: 'STATE_ADMIN',
            email: 'admin@test.com',
            password: 'password123',
            secretCode: 'ADM@2025'
        });

        const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            email: 'admin@test.com',
            otp: '123456'
        });
        const token = verifyRes.data.token;
        console.log(`✅ Logged in.`);

        console.log("--- CREATE TASK ---");
        const createRes = await axios.post(`${API_URL}/tasks`, {
            title: "Toggle Test",
            assignedToRole: "ADMIN"
        }, { headers: { Authorization: `Bearer ${token}` } });
        const taskId = createRes.data._id;
        console.log(`✅ Task Created: ${taskId}`);

        console.log("--- ATTEMPT TOGGLE (PATCH) ---");
        try {
            const toggleRes = await axios.patch(`${API_URL}/tasks/${taskId}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("✅ Toggle Success:", toggleRes.data.completed);
        } catch (e) {
            console.error("❌ Toggle Failed:", e.message);
            if (e.response) {
                console.error("Status:", e.response.status);
                console.error("Data:", e.response.data);
            }
        }

    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
};

run();
