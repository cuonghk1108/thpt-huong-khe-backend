import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Sự kiện', 'Hoạt động', 'Cơ sở vật chất'],
    default: 'Hoạt động'
  },
  description: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Gallery', gallerySchema);
