import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Principal

    targetAudience: {
        type: String,
        enum: ['ALL', 'TEACHERS', 'STUDENTS', 'SPECIFIC_CLASS'],
        default: 'ALL'
    },

    targetClass: { type: String }, // e.g., "5A" (Required if targetAudience is SPECIFIC_CLASS)

    isEmergency: { type: Boolean, default: false },

    deliveryStatus: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);
