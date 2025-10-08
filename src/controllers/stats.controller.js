// controllers/stats.controller.js
const Order = require("../models/order.model");      // ✅ your orders collection
const Product = require("../models/product.model");  // ✅ your products collection

// GET /api/stats
exports.getStats = async (req, res) => {
  try {
    const salesAgg = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalSales = salesAgg[0]?.total || 0;
    const productsCount = await Product.countDocuments();
    const collectionsCount = await Product.distinct("collections");
    const discountsCount = await Product.countDocuments({ discount: { $gt: 0 } });

    res.json({
      sales: totalSales,
      products: productsCount,
      collections: collectionsCount.length,
      discounts: discountsCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// GET /api/stats/salesTrend
exports.getSalesTrend = async (req, res) => {
  try {
    // Group orders by month (last 6 months)
    const sales = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          sales: { $sum: "$total" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Map to { month: "Jan", sales: 200 }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = sales.map(s => ({
      month: monthNames[s._id - 1],
      sales: s.sales,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales trend" });
  }
};

// GET /api/stats/productsByCategory
exports.getProductsByCategory = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);

    res.json(data.map(d => ({ name: d._id, value: d.value })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};
