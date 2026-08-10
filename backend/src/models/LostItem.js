const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Electronics', 'Pets', 'Documents', 'Jewelry', 'Clothing', 'Bags', 'Keys', 'Books', 'Other']
  },
  color: {
    type: String,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    city: String,
    state: String,
    country: String
  },
  dateLost: {
    type: Date,
    required: true
  },
  images: [{
    type: String
  }],
  reward: {
    type: Number,
    min: [0, 'Reward cannot be negative']
  },
  contactEmail: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  contactPhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid phone number']
  },
  status: {
    type: String,
    enum: ['open', 'claimed', 'closed'],
    default: 'open'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  qrCode: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
LostItemSchema.index({ 
  title: 'text', 
  description: 'text',
  category: 1,
  location: '2dsphere'
});

module.exports = mongoose.model('LostItem', LostItemSchema);