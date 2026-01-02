import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://rnk:rnkrnk@cluster0.i2hud05.mongodb.net/?appName=Cluster0';

console.log("Attempting to connect to:", MONGO_URI);

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout
        });
        console.log("✅ Use Local/Atlas Connected Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
        process.exit(1);
    }
};

connectDB();
