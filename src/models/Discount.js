const mongoose = require('mongoose');

// Simple discount model: percentage or fixed amount applied to products that match criteria.
const DiscountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage','fixed'], default: 'percentage' },
  value: { type: Number, required: true },
  // criteria: category, collection, productIds, or global
  criteria: {
    global: { type: Boolean, default: false },
    collections: [String],
    categories: [String],
    productIds: [String],
  },
  active: { type: Boolean, default: true },
  startsAt: Date,
  endsAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Discount', DiscountSchema);