
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance');
        console.log("Connected to DB");

        const indexes = await mongoose.connection.db.collection('students').indexes();
        console.log("Indexes on 'students' collection:");
        console.dir(indexes, { depth: null });

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkIndexes();
