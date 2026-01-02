import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5555/api';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);

        // 1. Setup Test User with Reset Token
        const resetTokenRaw = crypto.randomBytes(20).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');

        // Ensure unique email
        const email = `frontend.test.${Date.now()}@test.com`;

        const user = await User.create({
            name: "Frontend Payload Tester",
            email: email,
            password: "oldPassword123",
            mobile: "9999999999",
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: Date.now() + 10 * 60 * 1000
        });

        console.log(`✅ User Setup Complete. ID: ${user._id}`);
        console.log(`   Reset Token (URL Safe): ${resetTokenRaw}`);

        // 2. Simulate Frontend Axios Call
        // Frontend does: axios.put(`${config.API_URL}/api/auth/resetpassword/${resetToken}`, { password })
        console.log("🚀 Sending PUT request mimicking Frontend...");

        const newPassword = "realFrontendPassword123";
        try {
            const res = await axios.put(`${API_URL}/auth/resetpassword/${resetTokenRaw}`, {
                password: newPassword
            });
            console.log("✅ Response:", res.data);
        } catch (apiErr) {
            console.error("❌ API Call Failed:", apiErr.response ? apiErr.response.data : apiErr.message);
            process.exit(1);
        }

        // 3. Verify Database State
        const finalUser = await User.findById(user._id);

        // Check if password hash changed
        const isMatch = await import('bcryptjs').then(b => b.compare(newPassword, finalUser.password));

        if (isMatch) {
            console.log("✅ SUCCESS: Password updated via API and Hashed correctly in DB.");
        } else {
            console.error("❌ FAILURE: Password in DB does not match expected new password.");
            console.log("   Stored Hash:", finalUser.password);
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        process.exit(0);

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
        process.exit(1);
    }
}

run();
