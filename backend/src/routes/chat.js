const express = require('express');
const router = express.Router();
const { 
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  getChatUsers
} = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.get('/conversations', auth, getConversations);
router.get('/users', auth, getChatUsers);
router.get('/unread/count', auth, getUnreadCount);
router.get('/:userId', auth, getMessages);
router.post('/', auth, sendMessage);
router.put('/read/:userId', auth, markAsRead);

module.exports = router;