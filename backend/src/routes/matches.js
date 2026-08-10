const express = require('express');
const router = express.Router();
const { 
  findMatchesForLost,
  findMatchesForFound,
  findMyMatches,
  notifyMatches
} = require('../controllers/matchController');
const auth = require('../middleware/auth');

router.get('/lost/:id', auth, findMatchesForLost);
router.get('/found/:id', auth, findMatchesForFound);
router.get('/my-matches', auth, findMyMatches);
router.post('/notify/:itemId', auth, notifyMatches);

module.exports = router;