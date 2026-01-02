
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
        const res = await axios.post(`${API_URL}/auth/login`, {
            claimedRole: 'STATE_ADMIN',
            email: 'admin@test.com',
            password: 'password123',
            secretCode: 'ADM@2025'
        });

        const otpRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            email: 'admin@test.com',
            otp: '123456'
        });
        const token = otpRes.data.token;
        const user = otpRes.data.user;
        console.log(`✅ Logged in as ${user.role}`);

        console.log("--- ADMIN CREATING TASK (Role: ADMIN) ---");
        const taskPayload = {
            title: "Admin Task Test",
            category: "Admin",
            assignedToRole: "ADMIN" // UI sends this
        };
        const createRes = await axios.post(`${API_URL}/tasks`, taskPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const taskId = createRes.data._id;
        console.log(`✅ Task Created: ${taskId}`);

        console.log("--- ADMIN FETCHING TASKS ---");
        const list = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const found = list.data.find(t => t._id === taskId);

        if (found) {
            console.log("✅ Admin SEES the task.");
        } else {
            console.error("❌ Admin DOES NOT SEE the task (Role Mismatch suspected).");
            console.log("User Role:", user.role);
            console.log("Task Assigned Role:", "ADMIN");
        }

    } catch (err) {
        console.error("❌ ERROR:", err.message);
        if (err.response) console.error(err.response.data);
    }
};

run();
