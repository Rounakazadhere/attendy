import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Roles: STAFF = Teacher/Worker, ADMIN = Govt Official, PRINCIPAL = School Head
  role: {
    type: String,
    enum: ['STATE_ADMIN', 'DISTRICT_ADMIN', 'BLOCK_ADMIN', 'VILLAGE_ADMIN', 'PRINCIPAL', 'STAFF', 'PARENT'],
    default: 'STAFF'
  },

  // Identification
  employeeId: { type: String, unique: true, sparse: true }, // Govt ID
  mobile: { type: String, required: true },

  // Hierarchy / Location (For Filtering)
  state: { type: String, default: 'Bihar' }, // Example default
  district: { type: String },
  block: { type: String },
  village: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }, // Optional linkage

  // Teaching / Parenting Data
  assignedClass: { type: String }, // e.g., "5A" (For Teachers)
  childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // (For Parents)

  // Geo-Fencing: Designated Workplace Coordinates
  officeLocation: {
    lat: { type: Number }, // Latitude of School/Office
    lng: { type: Number }, // Longitude of School/Office
    radius: { type: Number, default: 200 } // Allowed radius in meters (default 200m)
  }

}, { timestamps: true });

export default mongoose.model('User', userSchema);