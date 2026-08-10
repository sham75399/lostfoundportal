const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lost-items', require('./routes/lostItems'));
app.use('/api/found-items', require('./routes/foundItems'));
app.use('/api/search', require('./routes/search'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

// ✅ Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // ✅ Join user to their room
  socket.on('join-room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`📌 User ${userId} joined room`);
    }
  });

  // ✅ Send message
  socket.on('send-message', async (data) => {
    console.log('📨 Message received:', data);
    
    // Save message to database
    try {
      const Message = require('./models/Message');
      const message = await Message.create({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content,
        claim: data.claimId || null
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email avatar')
        .populate('receiver', 'name email avatar');

      // Emit to receiver
      io.to(data.receiverId).emit('receive-message', populatedMessage);
      
      // Also emit back to sender for confirmation
      io.to(data.senderId).emit('message-sent', populatedMessage);
      
      console.log('✅ Message sent to:', data.receiverId);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  // ✅ Typing indicator
  socket.on('typing', (data) => {
    io.to(data.receiverId).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // ✅ Mark messages as read
  socket.on('mark-read', async (data) => {
    try {
      const Message = require('./models/Message');
      await Message.updateMany(
        {
          sender: data.senderId,
          receiver: data.receiverId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );
      io.to(data.senderId).emit('messages-read', {
        receiverId: data.receiverId
      });
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});