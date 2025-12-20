import mongoose from 'mongoose';

const studentAttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'LATE'],
        required: true
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Teacher who marked
    absenceReason: { type: String },
    parentNotified: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent multiple records for same student on same day
studentAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('StudentAttendance', studentAttendanceSchema);
