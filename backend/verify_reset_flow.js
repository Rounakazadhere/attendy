import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ DB Connected");

        // 1. Create User
        const email = `reset.test.${Date.now()}@test.com`;
        const initialPassword = 'initialPassword123';
        const user = await User.create({
            name: "Reset Flow User",
            email: email,
            password: initialPassword,
            mobile: "1111111111"
        });
        console.log(`✅ User Created: ${user.email}`);

        // 2. Generate Reset Token (Simulate Forgot Password)
        const resetTokenRaw = crypto.randomBytes(20).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        console.log("✅ Reset Token Saved to User");

        // 3. Simulate Reset Password Route Logic
        // Logic from auth.js: Find by token -> Update password -> Save
        const foundUser = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!foundUser) throw new Error("User not found by token!");

        const newPassword = 'newPasswordUpdated';
        console.log(`🔄 Resetting Password to: ${newPassword}`);

        // CRITICAL: We are setting it as PLAIN TEXT now, expecting the model to hash it
        foundUser.password = newPassword;
        foundUser.resetPasswordToken = undefined;
        foundUser.resetPasswordExpire = undefined;

        await foundUser.save();
        console.log("✅ User Saved with New Password");

        // 4. Verify Login with New Password
        const finalUser = await User.findById(user._id);
        const isMatch = await bcrypt.compare(newPassword, finalUser.password);

        console.log(`🔍 Verification Results:`);
        console.log(`   - Stored Hash: ${finalUser.password}`);
        console.log(`   - Is Match? ${isMatch}`);

        if (isMatch) {
            console.log("✅ SUCCESS: Reset Password Flow Verified!");
        } else {
            console.error("❌ FAILURE: Password NOT updated correctly.");
            process.exit(1);
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        process.exit(0);

    } catch (err) {
        console.error("❌ Fatal Error:", err);
        process.exit(1);
    }
}

run();
