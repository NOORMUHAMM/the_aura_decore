const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const { computeDiscountForProduct } = require('../utils/discounts');

// GET /api/products?page=1&limit=12&category=&collection=
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 12, 100);
  const filter = {};
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.collection) filter.collections = req.query.collection;
  filter.active = true;

  const items = await Product.find(filter).skip((page-1)*limit).limit(limit).lean().exec();
  res.json({ items, total: items.length });
});

// GET single
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).lean().exec();
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Protected: create
router.post('/', auth, async (req, res) => {
  const payload = req.body;
  const product = new Product(payload);
  // compute discounts
  const { percent, finalPrice } = await computeDiscountForProduct(product);
  product.discount = percent;
  product.discountedPrice = finalPrice;
  await product.save();
  res.json(product);
});

// Protected: update
router.put('/:id', auth, async (req, res) => {
  const payload = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true }).exec();
  if (!product) return res.status(404).json({ error: 'Not found' });
  const { percent, finalPrice } = await computeDiscountForProduct(product);
  product.discount = percent;
  product.discountedPrice = finalPrice;
  await product.save();
  res.json(product);
});

// Protected: delete
router.delete('/:id', auth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id).exec();
  res.json({ ok: true });
});

module.exports = router;
