const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

// @desc    Search all items
// @route   GET /api/search
exports.searchItems = async (req, res) => {
  try {
    const { 
      keyword, 
      category, 
      location, 
      dateFrom, 
      dateTo,
      type,
      page = 1,
      limit = 20,
      sort = 'newest'
    } = req.query;

    console.log('🔍 Search params:', req.query);

    // Build query for lost items
    const lostQuery = { isApproved: true };
    const foundQuery = { isApproved: true };

    // ✅ If no keyword, show all items (don't filter)
    if (keyword && keyword.trim()) {
      const searchRegex = { $regex: keyword.trim(), $options: 'i' };
      const lostSearch = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };
      lostQuery.$and = [lostSearch];
      foundQuery.$and = [lostSearch];
    }
    // ✅ If no keyword, don't add any filter - show ALL items

    // Category filter
    if (category && category !== 'all' && category !== '') {
      lostQuery.category = category;
      foundQuery.category = category;
    }

    // Location filter
    if (location && location.trim()) {
      const locationRegex = { $regex: location.trim(), $options: 'i' };
      lostQuery['location.address'] = locationRegex;
      foundQuery['location.address'] = locationRegex;
    }

    // Date range
    if (dateFrom || dateTo) {
      const dateQuery = {};
      if (dateFrom) dateQuery.$gte = new Date(dateFrom);
      if (dateTo) dateQuery.$lte = new Date(dateTo);
      lostQuery.dateLost = dateQuery;
      foundQuery.dateFound = dateQuery;
    }

    console.log('🔍 Lost query:', JSON.stringify(lostQuery, null, 2));
    console.log('🔍 Found query:', JSON.stringify(foundQuery, null, 2));

    let lostItems = [];
    let foundItems = [];

    // Fetch items based on type
    if (!type || type === 'all') {
      [lostItems, foundItems] = await Promise.all([
        LostItem.find(lostQuery)
          .populate('user', 'name email avatar')
          .sort(sort === 'newest' ? '-createdAt' : 'createdAt')
          .limit(limit * 1)
          .skip((page - 1) * limit),
        FoundItem.find(foundQuery)
          .populate('user', 'name email avatar')
          .sort(sort === 'newest' ? '-createdAt' : 'createdAt')
          .limit(limit * 1)
          .skip((page - 1) * limit)
      ]);
    } else if (type === 'lost') {
      lostItems = await LostItem.find(lostQuery)
        .populate('user', 'name email avatar')
        .sort(sort === 'newest' ? '-createdAt' : 'createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } else if (type === 'found') {
      foundItems = await FoundItem.find(foundQuery)
        .populate('user', 'name email avatar')
        .sort(sort === 'newest' ? '-createdAt' : 'createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    // Combine results
    const allItems = [
      ...lostItems.map(item => ({ 
        ...item.toObject(), 
        type: 'lost',
        date: item.dateLost
      })),
      ...foundItems.map(item => ({ 
        ...item.toObject(), 
        type: 'found',
        date: item.dateFound
      }))
    ];

    // ✅ Sort combined results
    if (sort === 'newest') {
      allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      allItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    console.log(`✅ Found ${allItems.length} items`);

    res.json({
      success: true,
      data: allItems,
      stats: {
        total: allItems.length,
        lost: lostItems.length,
        found: foundItems.length
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allItems.length,
        pages: Math.ceil(allItems.length / limit)
      }
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};