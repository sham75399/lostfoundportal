const mongoose = require('mongoose');

const FoundItemSchema = new mongoose.Schema({
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
  dateFound: {
    type: Date,
    required: true
  },
  images: [{
    type: String
  }],
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
    enum: ['available', 'claimed'],
    default: 'available'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

FoundItemSchema.index({ 
  title: 'text', 
  description: 'text',
  category: 1,
  location: '2dsphere'
});

module.exports = mongoose.model('FoundItem', FoundItemSchema);