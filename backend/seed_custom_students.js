import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import User from './models/User.js';
import School from './models/School.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const generateStudents = () => {
    const students = [];
    const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const sections = ['A', 'B'];
    let phoneCounter = 9000000001;

    classes.forEach(cls => {
        sections.forEach(sec => {
            for (let i = 1; i <= 5; i++) {
                const num = i.toString().padStart(2, '0');
                const roll = `${cls}${sec}${num}`;

                students.push({
                    name: `Student ${cls}${sec}-${num}`,
                    rollNumber: roll,
                    class: cls,
                    section: sec,
                    classSection: `${cls}${sec}`,
                    gender: i % 2 === 0 ? "Female" : "Male",
                    parentName: `Parent ${roll}`,
                    parentContact: phoneCounter.toString(),
                    dateOfBirth: new Date(`2015-01-${num}`), // Dummy date
                    attendancePercentage: 85 + Math.floor(Math.random() * 15)
                });
                phoneCounter++;
            }
        });
    });
    return students;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rural-attendance');
        console.log("✅ DB Connected");

        // 1. Get School
        let school = await School.findOne();
        if (!school) {
            school = await School.create({
                name: "Digital Rural School",
                schoolCode: "DIGI001",
                address: "India",
                admin: new mongoose.Types.ObjectId()
            });
        }
        console.log(`🏫 Using School: ${school.name}`);

        const studentsData = generateStudents();
        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log(`🚀 Seeding ${studentsData.length} students...`);

        for (const data of studentsData) {

            // 2. Create/Update Student
            let student = await Student.findOneAndUpdate(
                { rollNumber: data.rollNumber, schoolId: school._id },
                {
                    name: data.name,
                    classSection: data.classSection,
                    parentPhone: data.parentContact,
                    schoolId: school._id,
                    dateOfBirth: data.dateOfBirth,
                    gender: data.gender,
                    currentAttendancePercentage: data.attendancePercentage
                },
                { upsert: true, new: true }
            );

            // 3. Create/Update Parent
            const parentEmail = `parent.${data.rollNumber}@school.com`;
            await User.findOneAndUpdate(
                { mobile: data.parentContact },
                {
                    name: data.parentName,
                    email: parentEmail,
                    password: hashedPassword,
                    role: 'PARENT',
                    schoolId: school._id,
                    $addToSet: { childrenIds: student._id } // Link child uniquely
                },
                { upsert: true, new: true }
            );

            process.stdout.write('.'); // Progress dot
        }

        console.log("\n✅ Bulk Seeding Complete!");
        console.log(`Examples:\n User: ${studentsData[0].name}, Roll: ${studentsData[0].rollNumber}, Parent Phone: ${studentsData[0].parentContact}`);
        process.exit(0);

    } catch (err) {
        console.error("\n❌ Seeding Failed:", err);
        process.exit(1);
    }
};

seed();
