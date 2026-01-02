// backend/seed.js
import mongoose from 'mongoose';
import Student from './models/Student.js';

mongoose.connect('mongodb://127.0.0.1:27017/rural_attendance')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error(err));

const students = [
    { name: "Rohan Kumar", rollNumber: "101", classSection: "5A", parentPhone: "9876543210" },
    { name: "Sita Devi", rollNumber: "102", classSection: "5A", parentPhone: "9123456789" },
    { name: "Amit Sharma", rollNumber: "103", classSection: "5A", parentPhone: "9988776655" },
    { name: "Priya Singh", rollNumber: "104", classSection: "5A", parentPhone: "9000011111" },
    { name: "Rahul Verma", rollNumber: "105", classSection: "5A", parentPhone: "8888822222" }
];

const seedDB = async () => {
    await Student.deleteMany({}); // Clears existing data
    await Student.insertMany(students);
    console.log("🌱 Database Seeded with 5 Students!");
    mongoose.connection.close();
};

seedDB();