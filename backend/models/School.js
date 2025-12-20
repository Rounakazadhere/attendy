import mongoose from 'mongoose';

const SchoolSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  schoolCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  address: { 
    type: String,
    required: true
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('School', SchoolSchema);