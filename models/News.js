import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  excerpt: String,
  content: String,
  imageUrl: String,
  category: {
    type: String,
    enum: ['Hoạt động', 'Thông báo', 'Gương sáng'],
    default: 'Hoạt động'
  },
  author: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('News', newsSchema);
