const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Collection = require('../models/Collection');

router.get('/', async (req, res) => {
  const items = await Collection.find({}).lean().exec();
  res.json(items);
});

router.post('/', auth, async (req, res) => {
  const c = new Collection(req.body);
  await c.save();
  res.json(c);
});

router.put('/:id', auth, async (req, res) => {
  const c = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  res.json(c);
});

router.delete('/:id', auth, async (req, res) => {
  await Collection.findByIdAndDelete(req.params.id).exec();
  res.json({ ok: true });
});

module.exports = router;
