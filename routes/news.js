import express from 'express';
import News from '../models/News.js';
import { io } from '../server.js';

const router = express.Router();

// GET all news
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET one news by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create news
router.post('/', async (req, res) => {
  try {
    console.log('📝 [API] POST /news received:', req.body);
    const news = new News(req.body);
    await news.save();
    
    console.log('✅ [DB] News saved to MongoDB:', news._id);
    
    // Broadcast to all connected clients
    io.emit('news:created', news);
    console.log('📡 [Socket.io] Emitted news:created event');
    
    res.status(201).json(news);
  } catch (error) {
    console.error('❌ [API] Error saving news:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PUT update news
router.put('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!news) return res.status(404).json({ error: 'News not found' });
    
    // Broadcast to all connected clients
    io.emit('news:updated', news);
    
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE news
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    
    // Broadcast to all connected clients
    io.emit('news:deleted', req.params.id);
    
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
