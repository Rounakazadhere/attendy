import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true }, // YYYY-MM-DD
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }, // Link to Class
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Link to Student
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        default: 'Present'
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Teacher who marked it
}, { timestamps: true });

// Prevent duplicate attendance for same student on same day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
