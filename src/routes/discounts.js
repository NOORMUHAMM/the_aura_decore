const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Discount = require('../models/Discount');
const Product = require('../models/Product');
const { computeDiscountForProduct } = require('../utils/discounts');

// list
router.get('/', async (req, res) => {
  const items = await Discount.find({}).lean().exec();
  res.json(items);
});

// protected: create and then re-evaluate affected products
router.post('/', auth, async (req, res) => {
  const d = new Discount(req.body);
  await d.save();
  // re-calc products (simple: recalc all active products — for small catalogs okay)
  const products = await Product.find({ active: true }).exec();
  for (const p of products) {
    const { percent, finalPrice } = await computeDiscountForProduct(p);
    p.discount = percent;
    p.discountedPrice = finalPrice;
    await p.save();
  }
  res.json(d);
});

router.put('/:id', auth, async (req, res) => {
  const d = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  // re-eval products
  const products = await Product.find({ active: true }).exec();
  for (const p of products) {
    const { percent, finalPrice } = await computeDiscountForProduct(p);
    p.discount = percent;
    p.discountedPrice = finalPrice;
    await p.save();
  }
  res.json(d);
});

router.delete('/:id', auth, async (req, res) => {
  await Discount.findByIdAndDelete(req.params.id).exec();
  const products = await Product.find({ active: true }).exec();
  for (const p of products) {
    const { percent, finalPrice } = await computeDiscountForProduct(p);
    p.discount = percent;
    p.discountedPrice = finalPrice;
    await p.save();
  }
  res.json({ ok: true });
});

module.exports = router;