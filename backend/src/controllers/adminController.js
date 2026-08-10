const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLostItems,
      totalFoundItems,
      totalClaims,
      pendingClaims,
      recentItems
    ] = await Promise.all([
      User.countDocuments(),
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      LostItem.find({ isApproved: false })
        .populate('user', 'name email')
        .limit(5)
        .sort('-createdAt')
    ]);

    // Get monthly data for chart
    const monthlyData = await LostItem.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        users: totalUsers,
        lostItems: totalLostItems,
        foundItems: totalFoundItems,
        claims: totalClaims,
        pendingClaims,
        recentItems,
        monthlyData: monthlyData.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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

// @desc    Get all items (lost & found)
// @route   GET /api/admin/items
exports.getItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, approved } = req.query;

    let items = [];
    let total = 0;

    if (!type || type === 'lost') {
      const query = {};
      if (status) query.status = status;
      if (approved !== undefined) query.isApproved = approved === 'true';

      const lostItems = await LostItem.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit);

      items = [...items, ...lostItems.map(i => ({ ...i.toObject(), type: 'lost' }))];
      total = await LostItem.countDocuments(query);
    }

    if (!type || type === 'found') {
      const query = {};
      if (status) query.status = status;
      if (approved !== undefined) query.isApproved = approved === 'true';

      const foundItems = await FoundItem.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit);

      items = [...items, ...foundItems.map(i => ({ ...i.toObject(), type: 'found' }))];
      total += await FoundItem.countDocuments(query);
    }

    // Sort by createdAt
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: items,
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

// @desc    Approve an item
// @route   PUT /api/admin/items/:id/approve
exports.approveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    let item;
    if (type === 'lost') {
      item = await LostItem.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
      );
    } else if (type === 'found') {
      item = await FoundItem.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Notify the user
    await Notification.create({
      user: item.user,
      type: 'admin',
      title: 'Item Approved',
      message: `Your item "${item.title}" has been approved and is now visible to everyone.`,
      link: `/item/${id}`,
      data: { itemId: id }
    });

    res.json({
      success: true,
      message: 'Item approved successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject/Delete an item
// @route   DELETE /api/admin/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;

    let item;
    if (type === 'lost') {
      item = await LostItem.findById(id);
      if (item) {
        // Notify user
        await Notification.create({
          user: item.user,
          type: 'admin',
          title: 'Item Rejected',
          message: `Your item "${item.title}" was rejected. Reason: ${reason || 'Violates community guidelines'}`,
          data: { itemId: id }
        });
        await item.deleteOne();
      }
    } else if (type === 'found') {
      item = await FoundItem.findById(id);
      if (item) {
        await Notification.create({
          user: item.user,
          type: 'admin',
          title: 'Item Rejected',
          message: `Your item "${item.title}" was rejected. Reason: ${reason || 'Violates community guidelines'}`,
          data: { itemId: id }
        });
        await item.deleteOne();
      }
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all claims (admin)
// @route   GET /api/admin/claims
exports.getClaims = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const claims = await Claim.find(query)
      .populate('claimant', 'name email avatar')
      .populate('owner', 'name email avatar')
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

// @desc    Update claim (admin)
// @route   PUT /api/admin/claims/:id
exports.updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.status = status;
    if (adminNotes) claim.adminNotes = adminNotes;
    await claim.save();

    // Notify both parties
    await Notification.create({
      user: claim.claimant,
      type: 'claim',
      title: `Claim ${status}`,
      message: `Your claim for item has been ${status} by admin.`,
      link: `/claims/${claim._id}`,
      data: { claimId: claim._id }
    });

    await Notification.create({
      user: claim.owner,
      type: 'claim',
      title: `Claim ${status}`,
      message: `The claim for your item has been ${status} by admin.`,
      link: `/claims/${claim._id}`,
      data: { claimId: claim._id }
    });

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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting self
    if (id === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all user's items and claims
    await LostItem.deleteMany({ user: id });
    await FoundItem.deleteMany({ user: id });
    await Claim.deleteMany({ 
      $or: [{ claimant: id }, { owner: id }] 
    });

    res.json({
      success: true,
      message: 'User and all associated data deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};