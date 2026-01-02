import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
    deadline: { type: Date },
    progress: { type: Number, default: 0 }, // 0 to 100
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users assigned
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
