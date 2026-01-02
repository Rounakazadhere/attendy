import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const testEmail = "reset_test_" + Date.now() + "@example.com";
        const oldPass = "OldPass123";
        const newPass = "NewPass456";

        // 1. Create User
        const hashedOld = await bcrypt.hash(oldPass, 10);
        const user = new User({
            name: "Reset Tester",
            email: testEmail,
            password: hashedOld,
            role: "STAFF",
            mobile: "1234567890",
            employeeId: "EMP" + Math.floor(Math.random() * 10000)
        });
        await user.save();
        console.log(`1. User Created: ${testEmail} (Pass: ${oldPass})`);

        // 2. Reset Token (Simulate /forgotpassword)
        const rawToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        console.log(`2. Token Generated: ${rawToken}`);

        // 3. Reset Password (Simulate /resetpassword logic directly to isolate DB)
       
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const foundUser = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!foundUser) throw new Error("User not found with token!");

        // Update Password
        foundUser.password = await bcrypt.hash(newPass, 10);
        foundUser.resetPasswordToken = undefined;
        foundUser.resetPasswordExpire = undefined;
        await foundUser.save();
        console.log(`3. Password Reset to: ${newPass}`);

        // 4. Verify Login (Simulate /login)
        const loginUser = await User.findOne({ email: testEmail });
        const isMatch = await bcrypt.compare(newPass, loginUser.password);

        if (isMatch) {
            console.log("✅ SUCCESS: New password works!");
        } else {
            console.error("❌ FAILURE: New password does NOT match!");
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log("Cleanup complete.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

run();
