import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    grade: { type: String, required: true },   // "5", "6", "10"
    section: { type: String, required: true }, // "A", "B", "C"
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
    roomNumber: { type: String }
}, {
    timestamps: true,
    // Virtual to get full name "5A"
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual Property: fullName (e.g., "5A")
classSchema.virtual('fullName').get(function () {
    return `${this.grade}${this.section}`;
});

// Ensure Grade+Section is unique (Cannot have two "5A" classes)
classSchema.index({ grade: 1, section: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
