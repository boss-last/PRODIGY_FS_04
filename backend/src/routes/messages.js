import express from 'express';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;
    const query = { room: roomId };
    if (before) query.createdAt = { $lt: new Date(before) };
    const messages = await Message.find(query)
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .then(msgs => msgs.reverse());
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dm/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id.toString();
    const { limit = 50, before } = req.query;
    const query = {
      room: null,
      $or: [
        { sender: myId, recipient: userId },
        { sender: userId, recipient: myId }
      ]
    };
    if (before) query.createdAt = { $lt: new Date(before) };
    const messages = await Message.find(query)
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .then(msgs => msgs.reverse());
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:messageId/read', authenticate, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, {
      $addToSet: { readBy: req.user._id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/unread', authenticate, async (req, res) => {
  try {
    const myId = req.user._id;
    const unread = await Message.find({
      recipient: myId,
      readBy: { $ne: myId },
      sender: { $ne: myId }
    }).populate('sender', 'username displayName');
    res.json(unread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
