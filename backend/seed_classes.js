import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from './models/Class.js';

dotenv.config();

// Hardcoded URI if dotenv fails (fallback)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance';

const seedClasses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const seedData = [
            { grade: "1", section: "A" }, { grade: "1", section: "B" },
            { grade: "2", section: "A" }, { grade: "2", section: "B" },
            { grade: "3", section: "A" }, { grade: "3", section: "B" },
            { grade: "4", section: "A" }, { grade: "4", section: "B" },
            { grade: "5", section: "A" }, { grade: "5", section: "B" },
            { grade: "6", section: "A" }, { grade: "6", section: "B" },
            { grade: "7", section: "A" }, { grade: "7", section: "B" },
            { grade: "8", section: "A" }, { grade: "8", section: "B" },
            { grade: "9", section: "A" }, { grade: "9", section: "B" },
            { grade: "10", section: "A" }, { grade: "10", section: "B" },
        ];

        const operations = seedData.map(cls => ({
            updateOne: {
                filter: { grade: cls.grade, section: cls.section },
                update: { $set: cls },
                upsert: true
            }
        }));

        await Class.bulkWrite(operations);
        console.log('Classes Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding classes:', error);
        process.exit(1);
    }
};

seedClasses();
