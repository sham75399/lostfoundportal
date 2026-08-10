const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  lostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem'
  },
  foundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem'
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proof: [{
    type: String
  }],
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', ClaimSchema);