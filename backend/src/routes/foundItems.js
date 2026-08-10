const express = require('express');
const router = express.Router();
const { 
  createFoundItem, 
  getFoundItems, 
  getFoundItem, 
  updateFoundItem,  // ✅ Make sure this is imported
  deleteFoundItem,
  getMyFoundItems
} = require('../controllers/foundItemController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', auth, upload.array('images', 5), createFoundItem);
router.get('/', getFoundItems);
router.get('/my-items', auth, getMyFoundItems);
router.get('/:id', getFoundItem);
router.put('/:id', auth, upload.array('images', 5), updateFoundItem);  // ✅ This route should exist
router.delete('/:id', auth, deleteFoundItem);

module.exports = router;