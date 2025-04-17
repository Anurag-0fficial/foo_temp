const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['UPS', 'Inverter', 'Stabilizer', 'Battery', 'Other']
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  kvaRating: {
    type: Number,
    required: false
  },
  specifications: {
    type: Map,
    of: String
  },
  imageURL: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 