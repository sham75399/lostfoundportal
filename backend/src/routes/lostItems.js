const express = require('express');
const router = express.Router();
const { 
  createLostItem, 
  getLostItems, 
  getLostItem, 
  updateLostItem, 
  deleteLostItem,
  getMyLostItems
} = require('../controllers/itemController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', auth, upload.array('images', 5), createLostItem);
router.get('/', getLostItems);
router.get('/my-items', auth, getMyLostItems);
router.get('/:id', getLostItem);
router.put('/:id', auth, upload.array('images', 5), updateLostItem);
router.delete('/:id', auth, deleteLostItem);

module.exports = router;