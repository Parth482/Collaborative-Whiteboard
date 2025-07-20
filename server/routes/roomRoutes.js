const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

console.log('✅ roomRoutes file loaded');

router.post('/join', async (req, res) => {
  console.log('✅ POST /api/rooms/join hit');

  const { roomId } = req.body;
  if (!roomId || roomId.length < 6 || roomId.length > 8) {
    return res.status(400).json({ error: 'Invalid room code' });
  }

  let room = await Room.findOne({ roomId });
  if (!room) {
    room = await Room.create({ roomId });
  } else {
    room.lastActivity = new Date();
    await room.save();
  }

  res.json(room);
});


router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  console.log(`✅ GET /api/rooms/${roomId} hit`);

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('❌ Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:roomId/drawing', async (req, res) => {
  const { roomId } = req.params;
  const { drawingData } = req.body;

  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).json({ error: 'Room not found' });

  room.drawingData = drawingData;
  room.lastActivity = new Date();
  await room.save();

  res.json({ message: 'Drawing saved' });
});

router.post('/:roomId/clear', async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });

  if (!room) return res.status(404).json({ error: 'Room not found' });

  room.drawingData = [];
  await room.save();

  res.json({ message: 'Drawing cleared' });
});


module.exports = router;
