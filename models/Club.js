import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: String,
  members: {
    type: Number,
    default: 0
  },
  schedule: String,
  leader: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Club', clubSchema);
