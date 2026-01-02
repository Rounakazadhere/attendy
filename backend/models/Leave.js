import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // If applicant is PARENT, this links to the specific child
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    type: {
        type: String,
        required: true,
        enum: ['Sick', 'Casual', 'Urgent']
    },
    dates: {
        type: [String], // Store as ["2024-12-20", "2024-12-21"]
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
