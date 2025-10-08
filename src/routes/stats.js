// src/routes/stats.js
const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// 📊 General stats
router.get("/", async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const collections = await Product.distinct("collections");
    const discounts = await Product.countDocuments({ discount: { $gt: 0 } });

    res.json({
      sales: 0, // no real sales yet
      products,
      collections: collections.length,
      discounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stats failed" });
  }
});

// 📈 Sales Trend → based on product creation dates
router.get("/salesTrend", async (req, res) => {
  try {
    const agg = await Product.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // group by month of creation
          sales: { $sum: 1 }, // count products created
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Map months to names (Jan, Feb, etc.)
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const data = agg.map((item) => ({
      month: months[item._id - 1],
      sales: item.sales,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sales trend failed" });
  }
});

// 🗂️ Products by Category
router.get("/productsByCategory", async (req, res) => {
  try {
    const agg = await Product.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);
    res.json(agg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Category stats failed" });
  }
});

module.exports = router;
