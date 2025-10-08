const Discount = require('../models/Discount');

/** compute applicable discount percentage for a product (based on active discounts) */
async function computeDiscountForProduct(product) {
  const now = new Date();
  const discounts = await Discount.find({ active: true, $or: [ { 'criteria.global': true }, { 'criteria.collections': { $in: product.collections || [] } }, { 'criteria.categories': { $in: product.categories || [] } }, { 'criteria.productIds': { $in: [product._id.toString()] } } ], $and: [ { $or: [ { startsAt: { $exists: false } }, { startsAt: { $lte: now } } ] }, { $or: [ { endsAt: { $exists: false } }, { endsAt: { $gte: now } } ] } ] }).exec();
  if (!discounts || discounts.length === 0) return { percent: 0, finalPrice: product.price };

  // Combine discounts: take the highest percentage-equivalent reduction.
  let bestFinal = product.price;
  for (const d of discounts) {
    let candidate = product.price;
    if (d.type === 'percentage') candidate = product.price * (1 - d.value / 100);
    else candidate = Math.max(0, product.price - d.value);
    if (candidate < bestFinal) bestFinal = candidate;
  }
  const percent = Math.round((1 - bestFinal / product.price) * 100);
  return { percent, finalPrice: Number(bestFinal.toFixed(2)) };
}

module.exports = { computeDiscountForProduct };