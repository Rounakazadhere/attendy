import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true }, // Unique per class (handled by index)
  classSection: { type: String, required: true },
  parentPhone: { type: String },
  status: { type: String, default: "Present" },

  // New Fields for Dashboard
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  admissionNumber: { type: String, sparse: true }, // Govt ID
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST'] }, // Rural reporting
  currentAttendancePercentage: { type: Number, default: 100 }

}, { timestamps: true });

// Compound Index: Roll Number must be unique ONLY within the same class
studentSchema.index({ rollNumber: 1, classSection: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);