const { Server } = require('socket.io');

const COLORS = ['black', 'red', 'blue', 'green', 'orange', 'purple', 'teal', 'brown'];
const roomCanvases = {};
const roomUsers = {};
const userCursors = {};
const userCursorTimers = {};
const roomActivity = {}; 

function socketHandler(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  
  setInterval(() => {
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    for (const roomId in roomActivity) {
      if (now - roomActivity[roomId] > TWENTY_FOUR_HOURS) {
        console.log(`🧹 Cleaning inactive room: ${roomId}`);

        delete roomCanvases[roomId];
        delete roomUsers[roomId];
        delete roomActivity[roomId];

        for (const userId in userCursors) {
          if (userCursors[userId].roomId === roomId) {
            delete userCursors[userId];
          }
        }
      }
    }
  }, 60 * 60 * 1000); 

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    const assignedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    socket.emit('yourId', socket.id);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      if (!roomCanvases[roomId]) roomCanvases[roomId] = { history: [], redoStack: [] };
      if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
      roomUsers[roomId].add(socket.id);

      userCursors[socket.id] = { color: assignedColor, roomId };
      roomActivity[roomId] = Date.now();

      socket.emit('syncCanvas', roomCanvases[roomId].history);
      io.to(roomId).emit('userCount', roomUsers[roomId].size);
    });

    socket.on('drawing', ({ roomId, data }) => {
      if (!roomCanvases[roomId]) return;
      roomCanvases[roomId].history.push(data);
      roomCanvases[roomId].redoStack = [];
      roomActivity[roomId] = Date.now();
      socket.to(roomId).emit('drawing', data);
    });

    socket.on('undo', (roomId) => {
      if (!roomCanvases[roomId] || roomCanvases[roomId].history.length === 0) return;
      const lastStroke = roomCanvases[roomId].history.pop();
      roomCanvases[roomId].redoStack.push(lastStroke);
      roomActivity[roomId] = Date.now();
      io.to(roomId).emit('syncCanvas', roomCanvases[roomId].history);
    });

    socket.on('redo', (roomId) => {
      if (!roomCanvases[roomId] || roomCanvases[roomId].redoStack.length === 0) return;
      const stroke = roomCanvases[roomId].redoStack.pop();
      roomCanvases[roomId].history.push(stroke);
      roomActivity[roomId] = Date.now();
      io.to(roomId).emit('drawing', stroke);
    });

    socket.on('clearCanvas', (roomId) => {
      if (!roomCanvases[roomId]) return;
      roomCanvases[roomId].history = [];
      roomCanvases[roomId].redoStack = [];
      roomActivity[roomId] = Date.now();
      io.to(roomId).emit('syncCanvas', []);
    });

    socket.on('cursorMove', ({ roomId, position }) => {
      const userInfo = userCursors[socket.id];
      if (!userInfo) return;

      roomActivity[roomId] = Date.now();

      io.to(roomId).emit('cursorMove', {
        userId: socket.id,
        position,
        color: userInfo.color
      });

      if (userCursorTimers[socket.id]) {
        clearTimeout(userCursorTimers[socket.id]);
      }

      userCursorTimers[socket.id] = setTimeout(() => {
        io.to(roomId).emit('removeCursor', socket.id);
      }, 5000);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      const info = userCursors[socket.id];
      if (info?.roomId) {
        const roomId = info.roomId;
        if (roomUsers[roomId]) {
          roomUsers[roomId].delete(socket.id);
          io.to(roomId).emit('userCount', roomUsers[roomId].size);
        }
        socket.to(roomId).emit('removeCursor', socket.id);
      }
      delete userCursors[socket.id];
    });
  });
}

module.exports = socketHandler;
