const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  description: String,
  price: { type: Number, required: true }, // base price in USD (store canonical currency)
  currency: { type: String, default: 'USD' },
  images: [String],
  categories: [String],
  collections: [String],
  inventory: { type: Number, default: 0 },
  // denormalized discount fields for fast read
  discount: { type: Number, default: 0 }, // percentage
  discountedPrice: { type: Number },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);