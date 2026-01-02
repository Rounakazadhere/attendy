import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/rural-attendance";

mongoose.connect(mongoUri)
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        const password = process.env.SECRET_PRINCIPAL || "PRI@2025";
        const hashedPassword = await bcrypt.hash(password, 10);

        const principal = await User.findOneAndUpdate(
            { role: 'PRINCIPAL' },
            {
                name: "Principal User",
                userId: "PRI001", // Login ID
                email: "principal@school.com",
                role: "PRINCIPAL",
                password: hashedPassword,
                employeeId: "PRI001"
            },
            { upsert: true, new: true }
        );

        console.log(`✅ Principal Seeded/Updated:`);
        console.log(`   Internal ID: ${principal._id}`);
        console.log(`   User ID (Login): PRI001`);
        console.log(`   Password: ${password}`);

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
