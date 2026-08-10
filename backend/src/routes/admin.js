const express = require('express');
const router = express.Router();
const { 
  getStats,
  getUsers,
  getItems,
  approveItem,
  deleteItem,
  getClaims,
  updateClaim,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
});

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/items', getItems);
router.get('/claims', getClaims);

router.put('/items/:id/approve', approveItem);
router.delete('/items/:id', deleteItem);
router.put('/claims/:id', updateClaim);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;