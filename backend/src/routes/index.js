const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const lostItemsRoutes = require('./lostItems');
const foundItemsRoutes = require('./foundItems');
const searchRoutes = require('./search');
const matchesRoutes = require('./matches');
const claimsRoutes = require('./claims');
const chatRoutes = require('./chat');
const adminRoutes = require('./admin');

// Register all routes
router.use('/auth', authRoutes);
router.use('/lost-items', lostItemsRoutes);
router.use('/found-items', foundItemsRoutes);
router.use('/search', searchRoutes);
router.use('/matches', matchesRoutes);
router.use('/claims', claimsRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);

module.exports = router;