const express = require('express');
const router = express.Router();
const { searchItems } = require('../controllers/searchController');

router.get('/', searchItems);

module.exports = router;