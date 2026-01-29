import express from 'express';
import Club from '../models/Club.js';
import { io } from '../server.js';

const router = express.Router();

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().sort({ createdAt: -1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET one club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create club
router.post('/', async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    
    // Broadcast to all connected clients
    io.emit('club:created', club);
    
    res.status(201).json(club);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update club
router.put('/:id', async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!club) return res.status(404).json({ error: 'Club not found' });
    
    // Broadcast to all connected clients
    io.emit('club:updated', club);
    
    res.json(club);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE club
router.delete('/:id', async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    
    // Broadcast to all connected clients
    io.emit('club:deleted', req.params.id);
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
