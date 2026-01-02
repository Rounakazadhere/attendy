
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
        console.log("--- LOGIN AS ADMIN (for Token) ---");
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
        const realUserId = verifyRes.data.user._id;

        console.log("--- SIMULATE STALE DATA (No User ID) ---");
        // Payload mimicking stale frontend state: private task, no role, undefined/missing user ID
        const payload = {
            title: "Invisible Task Test",
            category: "General",
            assignedToRole: "", // Private
            // assignedToUser omitted (undefined)
        };

        console.log("--- SENDING POST ---");
        const createRes = await axios.post(`${API_URL}/tasks`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const taskId = createRes.data._id;
        console.log(`✅ Task Created (Success): ${taskId}`);
        console.log("Data:", createRes.data);

        console.log("--- CHECKING VISIBILITY ---");
        const listRes = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const found = listRes.data.find(t => t._id === taskId);
        if (found) {
            console.log("✅ Task IS visible (Unexpected if logic holds).");
        } else {
            console.log("❌ Task IS NOT visible (Confirmed Hypothesis: Ghost Task).");
        }

    } catch (err) {
        console.error("❌ ERROR:", err.message);
        if (err.response) console.error(err.response.data);
    }
};

run();
