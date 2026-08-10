const FoundItem = require('../models/FoundItem');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Create found item
// @route   POST /api/found-items
exports.createFoundItem = async (req, res) => {
  try {
    const { 
      title, description, category, color, 
      location, dateFound, contactEmail, contactPhone 
    } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'lostfound/found');
        imageUrls.push(url);
      }
    }

    const itemData = {
      user: req.userId,
      title,
      description,
      category,
      color,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      dateFound,
      contactEmail,
      contactPhone,
      images: imageUrls,
      isApproved: true 
    };

    const item = await FoundItem.create(itemData);

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all found items
// @route   GET /api/found-items
exports.getFoundItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      category,
      search 
    } = req.query;

    const query = { isApproved: true };

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const items = await FoundItem.find(query)
      .populate('user', 'name email avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoundItem.countDocuments(query);

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

// @desc    Get single found item
// @route   GET /api/found-items/:id
exports.getFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('user', 'name email phone avatar');

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateFoundItem = async (req, res) => {
  try {
    console.log('📝 Updating found item...');
    console.log('Item ID:', req.params.id);
    console.log('User ID from token:', req.userId);
    console.log('User ID type:', typeof req.userId);
    console.log('Request body:', req.body);
    console.log('Files:', req.files?.length || 0);

    // ✅ Find the item
    let item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // ✅ Check ownership - convert both to strings for comparison
    if (item.user.toString() !== req.userId.toString()) {
      console.log('❌ Authorization failed - User is not the owner');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    console.log('✅ Authorization passed - User is the owner');

    // ✅ Get update data
    const updateData = { ...req.body };
    delete updateData.user;

    // ✅ Parse location if it's a string
    if (updateData.location && typeof updateData.location === 'string') {
      try {
        updateData.location = JSON.parse(updateData.location);
      } catch (e) {
        updateData.location = { address: updateData.location };
      }
    }

    // ✅ Handle image uploads - START WITH EXISTING IMAGES
    let updatedImages = [...item.images];

    // ✅ Check if we should keep existing images or remove some
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        if (Array.isArray(existingImages)) {
          updatedImages = existingImages;
          console.log(`📸 Keeping ${existingImages.length} existing images`);
        }
      } catch (e) {
        console.warn('Could not parse existingImages:', e.message);
      }
    }

    // ✅ Upload new images and ADD to existing ones
    if (req.files && req.files.length > 0) {
      console.log(`📎 Uploading ${req.files.length} new images...`);
      const newImageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'lostfound/found');
        newImageUrls.push(url);
        console.log(`☁️ Cloudinary upload success: ${url}`);
      }
      // ✅ ADD new images to existing ones (don't replace)
      updatedImages = [...updatedImages, ...newImageUrls];
      console.log(`✅ ${newImageUrls.length} new images uploaded successfully`);
    }

    // ✅ Set the images field
    updateData.images = updatedImages;

    console.log('📦 Update data:', JSON.stringify(updateData, null, 2));
    console.log('📸 Final images array:', updateData.images);

    // ✅ Update the item
    item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar');

    console.log('✅ Found item updated successfully:', item._id);

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('❌ Error updating found item:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete found item
// @route   DELETE /api/found-items/:id
exports.deleteFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    if (item.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    await item.deleteOne();

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

// @desc    Get my found items
// @route   GET /api/found-items/my-items
exports.getMyFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({ user: req.userId })
      .sort('-createdAt')
      .populate('user', 'name email avatar');

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};