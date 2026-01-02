import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },

    // Who is this event for?
    audience: {
        type: String,
        enum: ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS'],
        default: 'ALL'
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
