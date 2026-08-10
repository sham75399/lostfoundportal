const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const { uploadToCloudinary } = require('../middleware/upload');
const QRCode = require('qrcode');

// @desc    Create lost item
exports.createLostItem = async (req, res) => {
  try {
    console.log('📝 Creating lost item...');
    console.log('User ID:', req.userId);
    console.log('Files received:', req.files?.length || 0);
    console.log('Files:', req.files);

    const { 
      title, description, category, color, 
      location, dateLost, reward, contactEmail, contactPhone 
    } = req.body;

    // Validate required fields
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    if (!description) return res.status(400).json({ success: false, message: 'Description is required' });
    if (!category) return res.status(400).json({ success: false, message: 'Category is required' });
    if (!location) return res.status(400).json({ success: false, message: 'Location is required' });
    if (!dateLost) return res.status(400).json({ success: false, message: 'Date lost is required' });
    if (!contactEmail) return res.status(400).json({ success: false, message: 'Contact email is required' });

    // Parse location
    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        parsedLocation = { address: location };
      }
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const url = await uploadToCloudinary(file.buffer, 'lostfound/lost');
          imageUrls.push(url);
        }
      } catch (cloudinaryError) {
        console.warn('⚠️ Cloudinary upload failed:', cloudinaryError.message);
      }
    }

    const itemData = {
      user: req.userId,
      title,
      description,
      category,
      color: color || '',
      location: parsedLocation,
      dateLost,
      reward: reward || 0,
      contactEmail,
      contactPhone: contactPhone || '',
      images: imageUrls,
      isApproved: true
    };

    console.log('📦 Item data:', JSON.stringify(itemData, null, 2));
    const item = await LostItem.create(itemData);
    console.log('✅ Item created with ID:', item._id);
    console.log('✅ Images saved:', item.images.length);

    // Generate QR Code
    try {
      const qrData = `${process.env.FRONTEND_URL}/item/${item._id}`;
      const qrCode = await QRCode.toDataURL(qrData);
      item.qrCode = qrCode;
      await item.save();
    } catch (qrError) {
      console.warn('⚠️ QR Code generation failed:', qrError.message);
    }

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('❌ Error creating lost item:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateLostItem = async (req, res) => {
  try {
    console.log('📝 Updating lost item...');
    console.log('Item ID:', req.params.id);
    console.log('User ID from token:', req.userId);

    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    console.log('✅ Authorization passed - User is the owner');

    // ✅ Get update data from request body
    const updateData = { ...req.body };
    delete updateData.user;
    delete updateData.existingImages; // ✅ Remove this field

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
        const url = await uploadToCloudinary(file.buffer, 'lostfound/lost');
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
    const updatedItem = await LostItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('user', 'name email avatar');

    console.log('✅ Item updated successfully:', updatedItem._id);
    console.log('📸 Images in updated item:', updatedItem.images);

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('❌ Error updating lost item:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all lost items
exports.getLostItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      category,
      status,
      search 
    } = req.query;

    const query = { isApproved: true };

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const items = await LostItem.find(query)
      .populate('user', 'name email avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LostItem.countDocuments(query);

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

// @desc    Get single lost item
exports.getLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate('user', 'name email phone avatar');

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Increment views
    item.views += 1;
    await item.save();

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

// @desc    Delete lost item
exports.deleteLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check ownership
    if (item.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this item' 
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

// @desc    Get my lost items
exports.getMyLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({ user: req.userId })
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