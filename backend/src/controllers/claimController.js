const Claim = require('../models/Claim');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Create claim request
// @route   POST /api/claims
exports.createClaim = async (req, res) => {
  try {
    const { lostItemId, foundItemId, message, proof } = req.body;

    // Validate: Must provide either lost or found item
    if (!lostItemId && !foundItemId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either lost item or found item'
      });
    }

    let lostItem, foundItem;
    let ownerId;

    // Check if lost item exists
    if (lostItemId) {
      lostItem = await LostItem.findById(lostItemId);
      if (!lostItem) {
        return res.status(404).json({
          success: false,
          message: 'Lost item not found'
        });
      }
      ownerId = lostItem.user;

      // Check if already claimed
      const existingClaim = await Claim.findOne({
        lostItem: lostItemId,
        status: { $in: ['pending', 'accepted'] }
      });
      if (existingClaim) {
        return res.status(400).json({
          success: false,
          message: 'This item already has a pending claim'
        });
      }
    }

    // Check if found item exists
    if (foundItemId) {
      foundItem = await FoundItem.findById(foundItemId);
      if (!foundItem) {
        return res.status(404).json({
          success: false,
          message: 'Found item not found'
        });
      }
      ownerId = foundItem.user;

      const existingClaim = await Claim.findOne({
        foundItem: foundItemId,
        status: { $in: ['pending', 'accepted'] }
      });
      if (existingClaim) {
        return res.status(400).json({
          success: false,
          message: 'This item already has a pending claim'
        });
      }
    }

    // Prevent claiming your own item
    if (ownerId.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim your own item'
      });
    }

    // Create claim
    const claim = await Claim.create({
      lostItem: lostItemId,
      foundItem: foundItemId,
      claimant: req.userId,
      owner: ownerId,
      message,
      proof: proof || []
    });

    // Populate claim data
    const populatedClaim = await Claim.findById(claim._id)
      .populate('claimant', 'name email avatar phone')
      .populate('owner', 'name email avatar phone')
      .populate('lostItem')
      .populate('foundItem');

    // Create notification for owner
    await Notification.create({
      user: ownerId,
      type: 'claim',
      title: 'New Claim Request',
      message: `${req.user.name} has claimed your item: ${lostItem?.title || foundItem?.title}`,
      link: `/claims/${claim._id}`,
      data: { claimId: claim._id }
    });

    res.status(201).json({
      success: true,
      data: populatedClaim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all claims for user
// @route   GET /api/claims
exports.getClaims = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {
      $or: [
        { claimant: req.userId },
        { owner: req.userId }
      ]
    };

    if (status) query.status = status;

    const claims = await Claim.find(query)
      .populate('claimant', 'name email avatar phone')
      .populate('owner', 'name email avatar phone')
      .populate('lostItem')
      .populate('foundItem')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Claim.countDocuments(query);

    res.json({
      success: true,
      data: claims,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's own claims (as claimant)
// @route   GET /api/claims/my-claims
exports.getMyClaims = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { claimant: req.userId };
    if (status) query.status = status;

    const claims = await Claim.find(query)
      .populate('owner', 'name email avatar phone')
      .populate('lostItem')
      .populate('foundItem')
      .sort('-createdAt');

    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get claim by item ID
// @route   GET /api/claims/item/:itemId
exports.getClaimByItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const claim = await Claim.findOne({
      $or: [
        { lostItem: itemId },
        { foundItem: itemId }
      ],
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('claimant', 'name email avatar')
    .populate('owner', 'name email avatar')
    .populate('lostItem')
    .populate('foundItem');

    res.json({
      success: true,
      data: claim || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
exports.getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimant', 'name email avatar phone')
      .populate('owner', 'name email avatar phone')
      .populate('lostItem')
      .populate('foundItem');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check authorization
    if (claim.claimant._id.toString() !== req.userId && 
        claim.owner._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim'
      });
    }

    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload proof documents for claim
// @route   POST /api/claims/:id/proof
exports.uploadProof = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Only claimant can upload proof
    if (claim.claimant.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the claimant can upload proof'
      });
    }

    // Upload files to Cloudinary
    const proofUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'lostfound/proof');
        proofUrls.push(url);
      }
    }

    claim.proof = [...claim.proof, ...proofUrls];
    await claim.save();

    res.json({
      success: true,
      data: claim,
      message: 'Proof uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update claim status
// @route   PUT /api/claims/:id
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check authorization - only owner can update status
    if (claim.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can update claim status'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    claim.status = status;
    await claim.save();

    // Update item status based on claim status
    if (status === 'accepted' || status === 'completed') {
      if (claim.lostItem) {
        await LostItem.findByIdAndUpdate(claim.lostItem, { 
          status: 'claimed' 
        });
      }
      if (claim.foundItem) {
        await FoundItem.findByIdAndUpdate(claim.foundItem, { 
          status: 'claimed' 
        });
      }
    }

    // If rejected, revert item status
    if (status === 'rejected') {
      if (claim.lostItem) {
        await LostItem.findByIdAndUpdate(claim.lostItem, { 
          status: 'open' 
        });
      }
      if (claim.foundItem) {
        await FoundItem.findByIdAndUpdate(claim.foundItem, { 
          status: 'available' 
        });
      }
    }

    // Populate for response
    const populatedClaim = await Claim.findById(claim._id)
      .populate('claimant', 'name email avatar')
      .populate('owner', 'name email avatar')
      .populate('lostItem')
      .populate('foundItem');

    // Notify claimant
    await Notification.create({
      user: claim.claimant,
      type: 'claim',
      title: `Claim ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your claim has been ${status} by the item owner.`,
      link: `/claims/${claim._id}`,
      data: { claimId: claim._id }
    });

    res.json({
      success: true,
      data: populatedClaim,
      message: `Claim ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a claim
// @route   DELETE /api/claims/:id
exports.deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Allow deletion by claimant or owner
    if (claim.claimant.toString() !== req.userId && 
        claim.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this claim'
      });
    }

    // Don't allow deletion if claim is completed
    if (claim.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a completed claim'
      });
    }

    // If pending, revert item status
    if (claim.status === 'pending') {
      if (claim.lostItem) {
        await LostItem.findByIdAndUpdate(claim.lostItem, { 
          status: 'open' 
        });
      }
      if (claim.foundItem) {
        await FoundItem.findByIdAndUpdate(claim.foundItem, { 
          status: 'available' 
        });
      }
    }

    await claim.deleteOne();

    res.json({
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};