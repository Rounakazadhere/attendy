import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if alert is about a teacher

    alertType: {
        type: String,
        enum: ['CONSECUTIVE_ABSENCE', 'LOW_ATTENDANCE', 'CHRONIC_ABSENTEE', 'TEACHER_LATE', 'TEACHER_ABSENT'],
        required: true
    },

    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },

    message: { type: String, required: true },

    actionTaken: { type: String }, // Principal's remarks
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Class teacher for follow-up

    resolved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);
