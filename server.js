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
  maxHttpBufferSize: 5e8,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  perMessageDeflate: false,
  upgradeTimeout: 30000
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
    if (socket.id === broadcaster && listeners.size > 0) {
      // Broadcast to all listeners efficiently
      for (const listenerId of listeners) {
        io.to(listenerId).emit('audio_chunk', data);
      }
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
    if (broadcaster) {
      io.to(broadcaster).emit('listener_count', listeners.size);
    }
    if (broadcaster) {
      socket.emit('broadcaster_connected');
    }
  });

  socket.on('listener_left', () => {
    listeners.delete(socket.id);
    if (broadcaster) {
      io.to(broadcaster).emit('listener_count', listeners.size);
    }
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
