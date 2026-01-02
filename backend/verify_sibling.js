
import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js'; // Adjust path
import Student from './models/Student.js'; // Adjust path
import dotenv from 'dotenv';
dotenv.config();

async function verifySibling() {
    try {
        console.log("🧪 Testing Sibling Linking...");
        // 1. Login as Principal
        const loginRes = await axios.post('http://localhost:5555/api/auth/login', {
            loginId: 'PRI001',
            password: 'PRI@2025',
            role: 'PRINCIPAL'
        });

        // Handle OTP if needed (mocked debugOtp)
        let token = loginRes.data.token;
        if (loginRes.data.step === 'OTP') {
            const otp = loginRes.data.debugOtp;
            const verifyRes = await axios.post('http://localhost:5555/api/auth/verify-otp', {
                email: loginRes.data.email,
                otp: otp
            });
            token = verifyRes.data.token;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const parentPhone = "9988776655";

        // 2. Add First Child
        const childA = {
            name: "Sibling A",
            rollNumber: "99A01",
            classSection: "99A",
            parentPhone: parentPhone,
            parentEmail: "sibling.parent@test.com"
        };

        console.log("Creating Child A...");
        try { await axios.post('http://localhost:5555/api/students', childA, { headers }); }
        catch (e) { console.log("Child A might exist, proceeding..."); }

        // 3. Add Second Child (Same Phone)
        const childB = {
            name: "Sibling B",
            rollNumber: "99A02",
            classSection: "99A",
            parentPhone: parentPhone,
            parentEmail: "sibling.parent@test.com"
        };

        console.log("Creating Child B (Should Link)...");
        const resB = await axios.post('http://localhost:5555/api/students', childB, { headers });
        console.log("Child B Response Credentials:", resB.data.parentCredentials);

        // 4. Inspect DB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance');

        const parent = await User.findOne({ mobile: parentPhone });
        console.log("\n--- Verification Results ---");
        if (parent) {
            console.log(`Parent Found: ${parent.name}`);
            console.log(`Children IDs Count: ${parent.childrenIds.length}`);
            console.log(`Children IDs:`, parent.childrenIds);

            if (parent.childrenIds.length >= 2) {
                console.log("✅ SUCCESS: Parent has multiple children linked!");
            } else {
                console.log("❌ FAILURE: Parent does not have multiple children.");
            }
        } else {
            console.log("❌ FAILURE: Parent account not found.");
        }

        // Cleanup (Optional)
        // await Student.deleteMany({ classSection: "99A" });
        // await User.deleteOne({ mobile: parentPhone });

        mongoose.connection.close();

    } catch (err) {
        console.error("Test Failed:", err.response ? err.response.data : err.message);
        try { mongoose.connection.close(); } catch (e) { }
    }
}

verifySibling();
