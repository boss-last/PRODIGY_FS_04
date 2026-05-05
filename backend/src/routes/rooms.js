import express from 'express';
import Room from '../models/Room.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { type: 'public' },
        { members: req.user._id },
        { creator: req.user._id }
      ]
    })
      .populate('creator', 'username displayName')
      .populate('members', 'username displayName status')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const room = new Room({
      name,
      description: description || '',
      type: type || 'public',
      creator: req.user._id,
      members: [req.user._id],
      moderators: [req.user._id]
    });
    await room.save();
    await room.populate('creator', 'username displayName');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:roomId/join', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:roomId/leave', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.members = room.members.filter(m => m.toString() !== req.user._id.toString());
    await room.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
