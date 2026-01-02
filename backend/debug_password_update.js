import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ DB Connected");

        // 1. Create a Test User
        const email = `test.pwd.${Date.now()}@test.com`;
        const initialPassword = 'password123';
        const hashedPassword = await bcrypt.hash(initialPassword, 10);

        const user = await User.create({
            name: "Password Test User",
            email: email,
            password: hashedPassword,
            mobile: "9999999999"
        });
        console.log(`✅ User Created: ${user.email} (ID: ${user._id})`);

        // 2. Simulate "Forgot Password" / Update Flow
        // Fetch user again to be sure
        let fetchedUser = await User.findById(user._id);

        const newPassword = 'newPassword456';
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        console.log("🔄 Updating Password...");
        fetchedUser.password = newHashedPassword; // Manually setting
        // Mark as modified if needed (though direct assignment usually does it)
        // fetchedUser.markModified('password'); 

        await fetchedUser.save();
        console.log("✅ Save Called");

        // 3. Verify
        const finalUser = await User.findById(user._id);
        const isMatch = await bcrypt.compare(newPassword, finalUser.password);

        console.log(`🔍 Verification:`);
        console.log(`   - New Password Plain: ${newPassword}`);
        console.log(`   - Stored Hash: ${finalUser.password}`);
        console.log(`   - Match? ${isMatch}`);

        if (isMatch) {
            console.log("✅ SUCCESS: Password updated correctly.");
        } else {
            console.error("❌ FAILURE: Password did not match.");
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

run();
