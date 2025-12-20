import mongoose from 'mongoose';

const classLogSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classSection: { type: String, required: true }, // E.g., "5A"
    subject: { type: String, required: true },     // E.g., "Maths"
    topic: { type: String, required: true },       // E.g., "Algebra Basics"
    date: { type: String, required: true }         // E.g., "2024-12-14" (Stored as string for easy query)
}, { timestamps: true });

export default mongoose.model('ClassLog', classLogSchema);
