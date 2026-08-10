const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all users the current user has chatted with
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('receiver', 'name email avatar')
    .sort('-createdAt');

    // Group by conversation partner
    const conversationMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId 
        ? msg.receiver 
        : msg.sender;
      
      const key = otherUser._id.toString();
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          user: otherUser,
          lastMessage: msg,
          unread: 0,
          lastMessageTime: msg.createdAt
        });
      }

      // Count unread messages
      if (!msg.isRead && msg.receiver._id.toString() === userId) {
        conversationMap.get(key).unread += 1;
      }
    });

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users for chat
// @route   GET /api/chat/users
exports.getChatUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('name email avatar phone')
      .limit(50);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages between two users
// @route   GET /api/chat/:userId
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('receiver', 'name email avatar')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/chat
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, claimId } = req.body;

    console.log('📨 Sending message:', { receiverId, content, claimId });

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver is required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const message = await Message.create({
      sender: req.userId,
      receiver: receiverId,
      content: content.trim(),
      claim: claimId || null
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    // Emit via socket.io
    const io = req.app.get('io');
    io.to(receiverId).emit('receive-message', populatedMessage);

    console.log('✅ Message sent successfully');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:userId
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: req.userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Emit via socket.io
    const io = req.app.get('io');
    io.to(userId).emit('messages-read', {
      receiverId: req.userId
    });

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread/count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { unread: count }
    });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};