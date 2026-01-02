import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: 'General' }, // Admin, Academic, etc.
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    assignedToRole: { type: String }, // 'Principal', 'Teacher', or null
    assignedToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Specific user
    details: { type: String }, // Long specific details
    comments: [{
        user: { type: String },
        text: String,
        time: { type: Date, default: Date.now }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
