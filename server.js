const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

let broadcaster = null;
let listeners = new Set();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('broadcaster', () => {
    broadcaster = socket.id;
    console.log('Broadcaster connected:', socket.id);
    socket.broadcast.emit('broadcaster_connected');
  });

  socket.on('audio_chunk', (data) => {
    if (socket.id === broadcaster) {
      socket.broadcast.emit('audio_chunk', data);
    }
  });

  socket.on('stream_start', () => {
    if (socket.id === broadcaster) {
      socket.broadcast.emit('stream_start');
    }
  });

  socket.on('stream_stop', () => {
    if (socket.id === broadcaster) {
      socket.broadcast.emit('stream_stop');
    }
  });

  socket.on('listener_joined', () => {
    listeners.add(socket.id);
    console.log('Listener joined:', socket.id, '- Total listeners:', listeners.size);
    if (broadcaster) {
      io.to(broadcaster).emit('listener_count', listeners.size);
    }
    if (broadcaster) {
      socket.emit('broadcaster_connected');
    }
  });

  socket.on('listener_left', () => {
    listeners.delete(socket.id);
    console.log('Listener left:', socket.id, '- Total listeners:', listeners.size);
    if (broadcaster) {
      io.to(broadcaster).emit('listener_count', listeners.size);
    }
  });
  
  // Handle ping to keep connection alive
  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    if (socket.id === broadcaster) {
      broadcaster = null;
      socket.broadcast.emit('stream_stop');
    }
    listeners.delete(socket.id);
    if (broadcaster) {
      io.to(broadcaster).emit('listener_count', listeners.size);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  🎙️ HITRADIO AUTOBUS Server Running!
  
  📻 Listener page: http://localhost:${PORT}
  🔒 Admin page: http://localhost:${PORT}#admin
  
  PIN: 1481
  `);
});
