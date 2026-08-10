const express = require('express');
const router = express.Router();
const { 
  createClaim, 
  getClaims, 
  getClaim, 
  updateClaimStatus,
  getMyClaims,
  getClaimByItem,
  uploadProof,
  deleteClaim
} = require('../controllers/claimController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All claim routes require authentication
router.use(auth);

// Create a new claim
router.post('/', createClaim);

// Get all claims for the logged-in user
router.get('/', getClaims);

// Get user's own claims
router.get('/my-claims', getMyClaims);

// Get claim by item ID (for checking if already claimed)
router.get('/item/:itemId', getClaimByItem);

// Upload proof documents for a claim
router.post('/:id/proof', upload.array('proof', 5), uploadProof);

// Get single claim by ID
router.get('/:id', getClaim);

// Update claim status (accept/reject)
router.put('/:id', updateClaimStatus);

// Delete a claim
router.delete('/:id', deleteClaim);

module.exports = router;