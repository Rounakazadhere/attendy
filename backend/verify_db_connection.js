import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log("Testing Connection to:", MONGO_URI ? MONGO_URI.split('@')[1] : "UNDEFINED");

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ FAILURE: Could not connect.", err.message);
        process.exit(1);
    });
