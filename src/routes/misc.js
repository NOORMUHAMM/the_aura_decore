const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Simple rates endpoint: return a USD-based rates object (USD and INR). Use EXCHANGE_API_URL if provided.
router.get('/rates', async (req, res) => {
  const fallback = { base: 'USD', rates: { USD: 1, INR: 83 } };
  try {
    if (process.env.EXCHANGE_API_URL) {
      const r = await fetch(process.env.EXCHANGE_API_URL);
      const data = await r.json();
      return res.json(data);
    }
  } catch (e) {
    console.warn('rates fetch failed', e.message);
  }
  res.json(fallback);
});

// simple deals endpoint - returns currently active discounts summary
const Discount = require('../models/Discount');
router.get('/deals', async (req, res) => {
  const now = new Date();
  const discounts = await Discount.find({ active: true, $or: [ { startsAt: { $exists: false } }, { startsAt: { $lte: now } } ], $or: [ { endsAt: { $exists: false } }, { endsAt: { $gte: now } } ] }).lean().exec();
  const deals = discounts.map(d => ({ title: d.name, subtitle: d.type === 'percentage' ? `${d.value}% off` : `Save $${d.value}`, cta: '/collections' }));
  res.json(deals);
});

module.exports = router;