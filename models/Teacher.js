import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: String,
  position: String,
  department: String,
  email: String,
  phone: String,
  imageUrl: String,
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Teacher', teacherSchema);
