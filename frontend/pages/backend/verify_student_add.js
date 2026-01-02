
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.loadEnvFile(path.join(__dirname, '.env'));

const API_URL = 'http://localhost:5555/api';
const SECRET_CODE = "PRI@2025"; // Principal
let TOKEN = "";

const run = async () => {
    try {
        console.log("--- 1. LOGIN AS PRINCIPAL ---");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            claimedRole: 'PRINCIPAL',
            email: 'principal@test.com',
            password: 'password123',
            secretCode: SECRET_CODE
        });
        console.log("✅ Login Initiated (OTP Sent)");

        console.log("--- 1.5 VERIFY OTP ---");
        const otpRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            email: 'principal@test.com',
            otp: '123456'
        });
        TOKEN = otpRes.data.token;
        console.log("✅ OTP Verified. Token acquired.");


        console.log("\n--- 2. ADD STUDENT (POST /api/students) ---");
        const payload = {
            name: "Script Added Student",
            rollNumber: "999",
            classSection: "5A", // Testing 5A
            parentPhone: "9999999999"
        };
        const addRes = await axios.post(`${API_URL}/students`, payload, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log("✅ Student Added:", addRes.data.name, addRes.data._id);

        console.log("\n--- 3. GET STUDENTS (GET /api/students/5A) ---");
        const getRes = await axios.get(`${API_URL}/students/5A`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log(`✅ Fetched ${getRes.data.length} students in 5A.`);

        const found = getRes.data.find(s => s.rollNumber === "999");
        if (found) {
            console.log("✅ Verified: Student is in the list.");

            console.log("\n--- 4. CLEANUP (DELETE) ---");
            await axios.delete(`${API_URL}/students/${found._id}`, {
                headers: { Authorization: `Bearer ${TOKEN}` }
            });
            console.log("✅ Student Deleted.");
        } else {
            console.error("❌ Student NOT found in list!");
            console.log("List:", getRes.data.map(s => s.name));
        }

    } catch (err) {
        console.error("❌ ERROR:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    }
};

run();
