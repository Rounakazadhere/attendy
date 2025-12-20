
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import School from './models/School.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
process.loadEnvFile(path.join(__dirname, '.env'));

const API_URL = 'http://localhost:5555/api/auth/register-school';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance';

const verify = async () => {
    console.log("--- VERIFYING SCHOOL REGISTRATION ---");

    // 1. UNIQUE DATA
    const timestamp = Date.now();
    const payload = {
        name: `Principal ${timestamp}`,
        email: `principal${timestamp}@test.com`,
        password: 'password123',
        schoolName: `School ${timestamp}`,
        address: 'Test Address'
    };

    try {
        // 2. CALL API
        console.log(`1. Calling API: ${API_URL}`);
        const res = await axios.post(API_URL, payload);
        console.log("   ✅ API Response:", res.status, res.data);

        if (res.status === 201) {
            const { schoolCode } = res.data;
            console.log(`   School Code received: ${schoolCode}`);

            // 3. CHECK DATABASE
            console.log(`2. Connecting to DB: ${MONGO_URI}`);
            await mongoose.connect(MONGO_URI);

            console.log("   Querying School collection...");
            const school = await School.findOne({ schoolCode });

            if (school) {
                console.log("   ✅ School FOUND in Database:");
                console.log(`      ID: ${school._id}`);
                console.log(`      Name: ${school.name}`);
                console.log(`      Code: ${school.schoolCode}`);
            } else {
                console.error("   ❌ School NOT FOUND in Database (Critical!)");
            }

            console.log("   Querying User collection...");
            const user = await User.findOne({ email: payload.email });
            if (user) {
                console.log("   ✅ Principal User FOUND in Database:");
                console.log(`      ID: ${user._id}`);
                console.log(`      Role: ${user.role}`);
                console.log(`      Linked SchoolId: ${user.schoolId}`);
            } else {
                console.error("   ❌ Principal User NOT FOUND in Database");
            }

        } else {
            console.error("   ❌ API did not return 201 Created");
        }

    } catch (err) {
        console.error("   ❌ Verification Script Failed:", err.message);
        if (err.response) console.error("      API Error Data:", err.response.data);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
