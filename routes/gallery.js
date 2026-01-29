import express from 'express';
import Gallery from '../models/Gallery.js';
import { io } from '../server.js';

const router = express.Router();

// GET all gallery images
router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET one image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload image
router.post('/', async (req, res) => {
  try {
    console.log('📝 [API] POST /gallery received:', req.body);
    const image = new Gallery(req.body);
    await image.save();
    
    console.log('✅ [DB] Gallery image saved:', image._id);
    
    // 🔴 Broadcast to all connected clients immediately
    io.emit('gallery:created', image);
    console.log(`📡 [Socket.io] Emitted gallery:created event`);
    
    res.status(201).json(image);
  } catch (error) {
    console.error('❌ [API] Error saving gallery:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PUT update image
router.put('/:id', async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    // Broadcast to all connected clients
    io.emit('gallery:updated', image);
    
    res.json(image);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE image
router.delete('/:id', async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    // Broadcast to all connected clients
    io.emit('gallery:deleted', req.params.id);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
