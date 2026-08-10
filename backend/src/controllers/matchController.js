const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');

// @desc    Find matches for a lost item
// @route   GET /api/matches/lost/:id
exports.findMatchesForLost = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    // Find matching found items
    const matches = await FoundItem.find({
      isApproved: true,
      status: 'available',
      category: lostItem.category,
      $text: { $search: lostItem.title + ' ' + lostItem.description }
    })
    .populate('user', 'name email avatar phone')
    .limit(20);

    // Calculate match scores
    const scoredMatches = matches.map(item => {
      let score = 0;
      
      // Category match (30 points)
      if (item.category === lostItem.category) score += 30;
      
      // Color match (20 points)
      if (item.color && lostItem.color && 
          item.color.toLowerCase() === lostItem.color.toLowerCase()) {
        score += 20;
      }
      
      // Location proximity (20 points)
      if (item.location?.address && lostItem.location?.address) {
        const loc1 = item.location.address.toLowerCase();
        const loc2 = lostItem.location.address.toLowerCase();
        if (loc1.includes(loc2) || loc2.includes(loc1)) {
          score += 20;
        }
      }
      
      // Text similarity (30 points)
      const titleMatch = item.title.toLowerCase().includes(lostItem.title.toLowerCase());
      const descMatch = item.description.toLowerCase().includes(lostItem.description.toLowerCase());
      if (titleMatch) score += 20;
      if (descMatch) score += 10;
      
      return {
        ...item.toObject(),
        matchScore: score
      };
    });

    // Sort by match score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: scoredMatches.filter(m => m.matchScore > 20)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Find matches for a found item
// @route   GET /api/matches/found/:id
exports.findMatchesForFound = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);
    
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    // Find matching lost items
    const matches = await LostItem.find({
      isApproved: true,
      status: 'open',
      category: foundItem.category,
      $text: { $search: foundItem.title + ' ' + foundItem.description }
    })
    .populate('user', 'name email avatar phone')
    .limit(20);

    // Calculate match scores
    const scoredMatches = matches.map(item => {
      let score = 0;
      
      // Category match (30 points)
      if (item.category === foundItem.category) score += 30;
      
      // Color match (20 points)
      if (item.color && foundItem.color && 
          item.color.toLowerCase() === foundItem.color.toLowerCase()) {
        score += 20;
      }
      
      // Location proximity (20 points)
      if (item.location?.address && foundItem.location?.address) {
        const loc1 = item.location.address.toLowerCase();
        const loc2 = foundItem.location.address.toLowerCase();
        if (loc1.includes(loc2) || loc2.includes(loc1)) {
          score += 20;
        }
      }
      
      // Date proximity (10 points)
      if (item.dateLost && foundItem.dateFound) {
        const daysDiff = Math.abs(
          new Date(item.dateLost) - new Date(foundItem.dateFound)
        ) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) score += 10;
      }
      
      // Text similarity (20 points)
      const titleMatch = item.title.toLowerCase().includes(foundItem.title.toLowerCase());
      const descMatch = item.description.toLowerCase().includes(foundItem.description.toLowerCase());
      if (titleMatch) score += 10;
      if (descMatch) score += 10;
      
      return {
        ...item.toObject(),
        matchScore: score
      };
    });

    // Sort by match score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: scoredMatches.filter(m => m.matchScore > 20)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Auto-match all items for a user
// @route   GET /api/matches/my-items
exports.findMyMatches = async (req, res) => {
  try {
    // Get user's lost items
    const lostItems = await LostItem.find({
      user: req.userId,
      isApproved: true,
      status: 'open'
    });

    // Get user's found items
    const foundItems = await FoundItem.find({
      user: req.userId,
      isApproved: true,
      status: 'available'
    });

    const allMatches = [];

    // Match each lost item with found items
    for (const lost of lostItems) {
      const matches = await FoundItem.find({
        isApproved: true,
        status: 'available',
        category: lost.category,
        $text: { $search: lost.title + ' ' + lost.description }
      })
      .populate('user', 'name email avatar phone')
      .limit(10);

      matches.forEach(item => {
        let score = 0;
        if (item.category === lost.category) score += 30;
        if (item.color && lost.color && 
            item.color.toLowerCase() === lost.color.toLowerCase()) {
          score += 20;
        }
        if (item.location?.address && lost.location?.address) {
          const loc1 = item.location.address.toLowerCase();
          const loc2 = lost.location.address.toLowerCase();
          if (loc1.includes(loc2) || loc2.includes(loc1)) {
            score += 20;
          }
        }
        if (score > 20) {
          allMatches.push({
            lostItem: lost,
            foundItem: item,
            matchScore: score
          });
        }
      });
    }

    // Sort by match score
    allMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: allMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create notification for matches
// @route   POST /api/matches/notify/:itemId
exports.notifyMatches = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { type } = req.body; // 'lost' or 'found'

    let item, matches;

    if (type === 'lost') {
      item = await LostItem.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Lost item not found'
        });
      }

      matches = await FoundItem.find({
        isApproved: true,
        status: 'available',
        category: item.category,
        $text: { $search: item.title + ' ' + item.description }
      });
    } else {
      item = await FoundItem.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Found item not found'
        });
      }

      matches = await LostItem.find({
        isApproved: true,
        status: 'open',
        category: item.category,
        $text: { $search: item.title + ' ' + item.description }
      });
    }

    // Send notifications to item owners
    const notifications = matches.map(match => ({
      user: match.user,
      type: 'match',
      title: 'Potential Match Found',
      message: `Your item "${match.title}" might match with "${item.title}"`,
      link: `/item/${match._id}`,
      data: { itemId: match._id }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message: `Notified ${notifications.length} users about matches`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};