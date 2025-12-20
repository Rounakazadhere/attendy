import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String, // Will be hashed
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 300 seconds = 5 minutes TTL
    },
    attempts: {
        type: Number,
        default: 0
    }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
