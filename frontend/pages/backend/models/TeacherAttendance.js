import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Staff Member
  date: { type: String, required: true }, // Format: YYYY-MM-DD (For easy querying)

  checkInTime: { type: Date, default: Date.now },

  // 📍 Location Verification (GPS)
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String } // Optional: Reverse geocoded address
  },

  // 🤳 Photo Evidence (Selfie)
  photoUrl: { type: String }, // Cloudinary URL or Local Path

  // 🛡️ Security / Anti-Proxy
  deviceId: { type: String }, // To prevent login from multiple phones

  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'LATE'],
    default: 'PRESENT'
  }

}, { timestamps: true });

// Prevent multiple check-ins per day for the same user
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('TeacherAttendance', attendanceSchema);