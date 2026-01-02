import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Student from './models/Student.js';
import User from './models/User.js';
import School from './models/School.js';

dotenv.config();

const studentsData = [
    { "name": "Student 1A-01", "class": "1", "section": "A", "rollNumber": "1A01", "email": "student1a01@schooldemo.com" },
    { "name": "Student 1A-02", "class": "1", "section": "A", "rollNumber": "1A02", "email": "student1a02@schooldemo.com" },
    { "name": "Student 1A-03", "class": "1", "section": "A", "rollNumber": "1A03", "email": "student1a03@schooldemo.com" },
    { "name": "Student 1A-04", "class": "1", "section": "A", "rollNumber": "1A04", "email": "student1a04@schooldemo.com" },
    { "name": "Student 1A-05", "class": "1", "section": "A", "rollNumber": "1A05", "email": "student1a05@schooldemo.com" },

    { "name": "Student 1B-01", "class": "1", "section": "B", "rollNumber": "1B01", "email": "student1b01@schooldemo.com" },
    { "name": "Student 1B-02", "class": "1", "section": "B", "rollNumber": "1B02", "email": "student1b02@schooldemo.com" },
    { "name": "Student 1B-03", "class": "1", "section": "B", "rollNumber": "1B03", "email": "student1b03@schooldemo.com" },
    { "name": "Student 1B-04", "class": "1", "section": "B", "rollNumber": "1B04", "email": "student1b04@schooldemo.com" },
    { "name": "Student 1B-05", "class": "1", "section": "B", "rollNumber": "1B05", "email": "student1b05@schooldemo.com" },

    { "name": "Student 2A-01", "class": "2", "section": "A", "rollNumber": "2A01", "email": "student2a01@schooldemo.com" },
    { "name": "Student 2A-02", "class": "2", "section": "A", "rollNumber": "2A02", "email": "student2a02@schooldemo.com" },
    { "name": "Student 2A-03", "class": "2", "section": "A", "rollNumber": "2A03", "email": "student2a03@schooldemo.com" },
    { "name": "Student 2A-04", "class": "2", "section": "A", "rollNumber": "2A04", "email": "student2a04@schooldemo.com" },
    { "name": "Student 2A-05", "class": "2", "section": "A", "rollNumber": "2A05", "email": "student2a05@schooldemo.com" },

    { "name": "Student 2B-01", "class": "2", "section": "B", "rollNumber": "2B01", "email": "student2b01@schooldemo.com" },
    { "name": "Student 2B-02", "class": "2", "section": "B", "rollNumber": "2B02", "email": "student2b02@schooldemo.com" },
    { "name": "Student 2B-03", "class": "2", "section": "B", "rollNumber": "2B03", "email": "student2b03@schooldemo.com" },
    { "name": "Student 2B-04", "class": "2", "section": "B", "rollNumber": "2B04", "email": "student2b04@schooldemo.com" },
    { "name": "Student 2B-05", "class": "2", "section": "B", "rollNumber": "2B05", "email": "student2b05@schooldemo.com" },

    { "name": "Student 3A-01", "class": "3", "section": "A", "rollNumber": "3A01", "email": "student3a01@schooldemo.com" },
    { "name": "Student 3A-02", "class": "3", "section": "A", "rollNumber": "3A02", "email": "student3a02@schooldemo.com" },
    { "name": "Student 3A-03", "class": "3", "section": "A", "rollNumber": "3A03", "email": "student3a03@schooldemo.com" },
    { "name": "Student 3A-04", "class": "3", "section": "A", "rollNumber": "3A04", "email": "student3a04@schooldemo.com" },
    { "name": "Student 3A-05", "class": "3", "section": "A", "rollNumber": "3A05", "email": "student3a05@schooldemo.com" },

    { "name": "Student 3B-01", "class": "3", "section": "B", "rollNumber": "3B01", "email": "student3b01@schooldemo.com" },
    { "name": "Student 3B-02", "class": "3", "section": "B", "rollNumber": "3B02", "email": "student3b02@schooldemo.com" },
    { "name": "Student 3B-03", "class": "3", "section": "B", "rollNumber": "3B03", "email": "student3b03@schooldemo.com" },
    { "name": "Student 3B-04", "class": "3", "section": "B", "rollNumber": "3B04", "email": "student3b04@schooldemo.com" },
    { "name": "Student 3B-05", "class": "3", "section": "B", "rollNumber": "3B05", "email": "student3b05@schooldemo.com" },

    { "name": "Student 4A-01", "class": "4", "section": "A", "rollNumber": "4A01", "email": "student4a01@schooldemo.com" },
    { "name": "Student 4A-02", "class": "4", "section": "A", "rollNumber": "4A02", "email": "student4a02@schooldemo.com" },
    { "name": "Student 4A-03", "class": "4", "section": "A", "rollNumber": "4A03", "email": "student4a03@schooldemo.com" },
    { "name": "Student 4A-04", "class": "4", "section": "A", "rollNumber": "4A04", "email": "student4a04@schooldemo.com" },
    { "name": "Student 4A-05", "class": "4", "section": "A", "rollNumber": "4A05", "email": "student4a05@schooldemo.com" },

    { "name": "Student 4B-01", "class": "4", "section": "B", "rollNumber": "4B01", "email": "student4b01@schooldemo.com" },
    { "name": "Student 4B-02", "class": "4", "section": "B", "rollNumber": "4B02", "email": "student4b02@schooldemo.com" },
    { "name": "Student 4B-03", "class": "4", "section": "B", "rollNumber": "4B03", "email": "student4b03@schooldemo.com" },
    { "name": "Student 4B-04", "class": "4", "section": "B", "rollNumber": "4B04", "email": "student4b04@schooldemo.com" },
    { "name": "Student 4B-05", "class": "4", "section": "B", "rollNumber": "4B05", "email": "student4b05@schooldemo.com" },

    { "name": "Student 5A-01", "class": "5", "section": "A", "rollNumber": "5A01", "email": "student5a01@schooldemo.com" },
    { "name": "Student 5A-02", "class": "5", "section": "A", "rollNumber": "5A02", "email": "student5a02@schooldemo.com" },
    { "name": "Student 5A-03", "class": "5", "section": "A", "rollNumber": "5A03", "email": "student5a03@schooldemo.com" },
    { "name": "Student 5A-04", "class": "5", "section": "A", "rollNumber": "5A04", "email": "student5a04@schooldemo.com" },
    { "name": "Student 5A-05", "class": "5", "section": "A", "rollNumber": "5A05", "email": "student5a05@schooldemo.com" },

    { "name": "Student 5B-01", "class": "5", "section": "B", "rollNumber": "5B01", "email": "student5b01@schooldemo.com" },
    { "name": "Student 5B-02", "class": "5", "section": "B", "rollNumber": "5B02", "email": "student5b02@schooldemo.com" },
    { "name": "Student 5B-03", "class": "5", "section": "B", "rollNumber": "5B03", "email": "student5b03@schooldemo.com" },
    { "name": "Student 5B-04", "class": "5", "section": "B", "rollNumber": "5B04", "email": "student5b04@schooldemo.com" },
    { "name": "Student 5B-05", "class": "5", "section": "B", "rollNumber": "5B05", "email": "student5b05@schooldemo.com" },

    { "name": "Student 6A-01", "class": "6", "section": "A", "rollNumber": "6A01", "email": "student6a01@schooldemo.com" },
    { "name": "Student 6A-02", "class": "6", "section": "A", "rollNumber": "6A02", "email": "student6a02@schooldemo.com" },
    { "name": "Student 6A-03", "class": "6", "section": "A", "rollNumber": "6A03", "email": "student6a03@schooldemo.com" },
    { "name": "Student 6A-04", "class": "6", "section": "A", "rollNumber": "6A04", "email": "student6a04@schooldemo.com" },
    { "name": "Student 6A-05", "class": "6", "section": "A", "rollNumber": "6A05", "email": "student6a05@schooldemo.com" },

    { "name": "Student 6B-01", "class": "6", "section": "B", "rollNumber": "6B01", "email": "student6b01@schooldemo.com" },
    { "name": "Student 6B-02", "class": "6", "section": "B", "rollNumber": "6B02", "email": "student6b02@schooldemo.com" },
    { "name": "Student 6B-03", "class": "6", "section": "B", "rollNumber": "6B03", "email": "student6b03@schooldemo.com" },
    { "name": "Student 6B-04", "class": "6", "section": "B", "rollNumber": "6B04", "email": "student6b04@schooldemo.com" },
    { "name": "Student 6B-05", "class": "6", "section": "B", "rollNumber": "6B05", "email": "student6b05@schooldemo.com" },

    { "name": "Student 7A-01", "class": "7", "section": "A", "rollNumber": "7A01", "email": "student7a01@schooldemo.com" },
    { "name": "Student 7A-02", "class": "7", "section": "A", "rollNumber": "7A02", "email": "student7a02@schooldemo.com" },
    { "name": "Student 7A-03", "class": "7", "section": "A", "rollNumber": "7A03", "email": "student7a03@schooldemo.com" },
    { "name": "Student 7A-04", "class": "7", "section": "A", "rollNumber": "7A04", "email": "student7a04@schooldemo.com" },
    { "name": "Student 7A-05", "class": "7", "section": "A", "rollNumber": "7A05", "email": "student7a05@schooldemo.com" },

    { "name": "Student 7B-01", "class": "7", "section": "B", "rollNumber": "7B01", "email": "student7b01@schooldemo.com" },
    { "name": "Student 7B-02", "class": "7", "section": "B", "rollNumber": "7B02", "email": "student7b02@schooldemo.com" },
    { "name": "Student 7B-03", "class": "7", "section": "B", "rollNumber": "7B03", "email": "student7b03@schooldemo.com" },
    { "name": "Student 7B-04", "class": "7", "section": "B", "rollNumber": "7B04", "email": "student7b04@schooldemo.com" },
    { "name": "Student 7B-05", "class": "7", "section": "B", "rollNumber": "7B05", "email": "student7b05@schooldemo.com" },

    { "name": "Student 8A-01", "class": "8", "section": "A", "rollNumber": "8A01", "email": "student8a01@schooldemo.com" },
    { "name": "Student 8A-02", "class": "8", "section": "A", "rollNumber": "8A02", "email": "student8a02@schooldemo.com" },
    { "name": "Student 8A-03", "class": "8", "section": "A", "rollNumber": "8A03", "email": "student8a03@schooldemo.com" },
    { "name": "Student 8A-04", "class": "8", "section": "A", "rollNumber": "8A04", "email": "student8a04@schooldemo.com" },
    { "name": "Student 8A-05", "class": "8", "section": "A", "rollNumber": "8A05", "email": "student8a05@schooldemo.com" },

    { "name": "Student 8B-01", "class": "8", "section": "B", "rollNumber": "8B01", "email": "student8b01@schooldemo.com" },
    { "name": "Student 8B-02", "class": "8", "section": "B", "rollNumber": "8B02", "email": "student8b02@schooldemo.com" },
    { "name": "Student 8B-03", "class": "8", "section": "B", "rollNumber": "8B03", "email": "student8b03@schooldemo.com" },
    { "name": "Student 8B-04", "class": "8", "section": "B", "rollNumber": "8B04", "email": "student8b04@schooldemo.com" },
    { "name": "Student 8B-05", "class": "8", "section": "B", "rollNumber": "8B05", "email": "student8b05@schooldemo.com" },

    { "name": "Student 9A-01", "class": "9", "section": "A", "rollNumber": "9A01", "email": "student9a01@schooldemo.com" },
    { "name": "Student 9A-02", "class": "9", "section": "A", "rollNumber": "9A02", "email": "student9a02@schooldemo.com" },
    { "name": "Student 9A-03", "class": "9", "section": "A", "rollNumber": "9A03", "email": "student9a03@schooldemo.com" },
    { "name": "Student 9A-04", "class": "9", "section": "A", "rollNumber": "9A04", "email": "student9a04@schooldemo.com" },
    { "name": "Student 9A-05", "class": "9", "section": "A", "rollNumber": "9A05", "email": "student9a05@schooldemo.com" },

    { "name": "Student 9B-01", "class": "9", "section": "B", "rollNumber": "9B01", "email": "student9b01@schooldemo.com" },
    { "name": "Student 9B-02", "class": "9", "section": "B", "rollNumber": "9B02", "email": "student9b02@schooldemo.com" },
    { "name": "Student 9B-03", "class": "9", "section": "B", "rollNumber": "9B03", "email": "student9b03@schooldemo.com" },
    { "name": "Student 9B-04", "class": "9", "section": "B", "rollNumber": "9B04", "email": "student9b04@schooldemo.com" },
    { "name": "Student 9B-05", "class": "9", "section": "B", "rollNumber": "9B05", "email": "student9b05@schooldemo.com" },

    { "name": "Student 10A-01", "class": "10", "section": "A", "rollNumber": "10A01", "email": "student10a01@schooldemo.com" },
    { "name": "Student 10A-02", "class": "10", "section": "A", "rollNumber": "10A02", "email": "student10a02@schooldemo.com" },
    { "name": "Student 10A-03", "class": "10", "section": "A", "rollNumber": "10A03", "email": "student10a03@schooldemo.com" },
    { "name": "Student 10A-04", "class": "10", "section": "A", "rollNumber": "10A04", "email": "student10a04@schooldemo.com" },
    { "name": "Student 10A-05", "class": "10", "section": "A", "rollNumber": "10A05", "email": "student10a05@schooldemo.com" },

    { "name": "Student 10B-01", "class": "10", "section": "B", "rollNumber": "10B01", "email": "student10b01@schooldemo.com" },
    { "name": "Student 10B-02", "class": "10", "section": "B", "rollNumber": "10B02", "email": "student10b02@schooldemo.com" },
    { "name": "Student 10B-03", "class": "10", "section": "B", "rollNumber": "10B03", "email": "student10b03@schooldemo.com" },
    { "name": "Student 10B-04", "class": "10", "section": "B", "rollNumber": "10B04", "email": "student10b04@schooldemo.com" },
    { "name": "Student 10B-05", "class": "10", "section": "B", "rollNumber": "10B05", "email": "student10b05@schooldemo.com" }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/rural-attendance";
        await mongoose.connect(mongoUri);
        console.log("✅ Custom Seed: Connected to MongoDB");

        // 1. Ensure School Exists
        let school = await School.findOne();
        if (!school) {
            school = new School({
                name: "Digital Rural School",
                code: "RURAL_001",
                district: "Patna",
                state: "Bihar"
            });
            await school.save();
            console.log("School Created:", school.name);
        }

        const defaultPassword = await bcrypt.hash("password123", 10);

        for (let i = 0; i < studentsData.length; i++) {
            const item = studentsData[i];

            // Construct fields
            const classSection = `${item.class}${item.section}`;
            const parentPhone = `900${item.class.padStart(2, '0')}${item.section === 'A' ? '0' : '1'}${item.rollNumber.slice(-2)}00`;
            // Example: Class 1A, Roll 01 -> 9000100100. Padded to ensure 10 digits

            // 2. Create/Update Student
            const existingStudent = await Student.findOne({ rollNumber: item.rollNumber, classSection });

            let studentId = null;
            if (!existingStudent) {
                const newStudent = new Student({
                    name: item.name,
                    rollNumber: item.rollNumber,
                    classSection: classSection,
                    parentPhone: parentPhone,
                    parentEmail: item.email,
                    schoolId: school._id,
                    status: 'Present'
                });
                const savedStudent = await newStudent.save();
                studentId = savedStudent._id;
                process.stdout.write('.');
            } else {
                studentId = existingStudent._id;
                // Update email/phone if changed
                existingStudent.parentEmail = item.email;
                existingStudent.parentPhone = parentPhone;
                await existingStudent.save();
                process.stdout.write('U');
            }

            // 3. Create/Link Parent User
            let parentUser = await User.findOne({ email: item.email });
            if (!parentUser) {
                parentUser = await User.findOne({ mobile: parentPhone });
            }

            if (!parentUser) {
                parentUser = new User({
                    name: `Parent of ${item.name}`,
                    email: item.email,
                    mobile: parentPhone,
                    password: defaultPassword,
                    role: 'PARENT',
                    childrenIds: [studentId],
                    schoolId: school._id
                });
                await parentUser.save();
            } else {
                // Ensure child link
                if (!parentUser.childrenIds.includes(studentId)) {
                    parentUser.childrenIds.push(studentId);
                    await parentUser.save();
                }
            }
        }

        //console.log("\n✅ Seeding Complete: 100 Students Processed.");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ Seeding Failed:", err);
        process.exit(1);
    }
}

seed();
