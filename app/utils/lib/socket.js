const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  },
});

io.on('connection', (socket) => {
  socket.emit('connection_success', { message: 'Connected!' });
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected. Reason:');
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running at http://localhost:3000/');
});


module.exports = io;