const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updateProfile 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/profile', auth, updateProfile);

module.exports = router;