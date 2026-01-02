
import axios from 'axios';
import mongoose from 'mongoose';
import Student from './models/Student.js'; // Ensure path is correct for where we run this script
import dotenv from 'dotenv';
dotenv.config();

async function inspectRolls() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rural-attendance');
        console.log("Connected to DB");

        // Check 6B specifically since user mentioned it
        // Or check all classes to see patterns
        const sections = ['6B', '5A'];

        for (const sec of sections) {
            console.log(`\n--- Inspecting Class ${sec} ---`);
            const students = await Student.find({ classSection: sec });

            if (students.length === 0) {
                console.log("No students found.");
                continue;
            }

            console.log(`Found ${students.length} students.`);
            const rolls = students.map(s => s.rollNumber);
            console.log("Roll Numbers:", rolls);

            // Replicate backend logic
            let maxRoll = 0;
            students.forEach(s => {
                let num = 0;
                // Logic from route
                if (/^\d+$/.test(s.rollNumber)) {
                    num = parseInt(s.rollNumber);
                } else {
                    const match = s.rollNumber.match(/\d+$/); // Extract suffix
                    if (match) num = parseInt(match[0]);
                }
                console.log(`Parsed '${s.rollNumber}' -> ${num}`);
                if (num > maxRoll) maxRoll = num;
            });
            console.log(`Calculated Max Roll: ${maxRoll}`);
            console.log(`Proposed Next: ${maxRoll + 1}`);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

inspectRolls();
