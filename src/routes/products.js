const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Product = require("../models/Product");
const { computeDiscountForProduct } = require("../utils/discounts");
const multer = require("multer");
const path = require("path");

// ⚙️ Multer config for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* --------------------------------------------------
   ✅ GET /api/products
   Supports pagination, filtering by category/collection
-------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const filter = { active: true };

    // 🧩 Filter by category (can support multiple via comma-separated list)
    if (req.query.category) {
      const cats = req.query.category.split(",").map((c) => c.trim());
      filter.categories = { $in: cats };
    }

    // 🧩 Filter by collection
    if (req.query.collection) {
      const cols = req.query.collection.split(",").map((c) => c.trim());
      filter.collections = { $in: cols };
    }

    const items = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    res.json({ items, total: items.length });
  } catch (err) {
    console.error("❌ Fetch products failed:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

/* --------------------------------------------------
   ✅ GET /api/products/categories
   Return all unique categories dynamically
-------------------------------------------------- */
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("categories");
    res.json(categories.filter(Boolean)); // Remove empty/null
  } catch (err) {
    console.error("❌ Get categories failed:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/* --------------------------------------------------
   ✅ GET /api/products/:id
-------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).lean().exec();
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (err) {
    console.error("❌ Get product failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------
   ✅ POST /api/products
   Create a new product (supports file upload)
-------------------------------------------------- */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    let payload = req.body;

    // If categories/collections are stringified (from form-data)
    if (payload.categories && typeof payload.categories === "string") {
      payload.categories = payload.categories.split(",");
    }
    if (payload.collections && typeof payload.collections === "string") {
      payload.collections = payload.collections.split(",");
    }

    // Add uploaded image if available
    if (req.file) {
      payload.images = [`/uploads/${req.file.filename}`];
    }

    const product = new Product(payload);
    const { percent, finalPrice } = await computeDiscountForProduct(product);
    product.discount = percent;
    product.discountedPrice = finalPrice;

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Create product failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------
   ✅ PUT /api/products/:id
   Update an existing product
-------------------------------------------------- */
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    let payload = req.body;

    if (payload.categories && typeof payload.categories === "string") {
      payload.categories = payload.categories.split(",");
    }
    if (payload.collections && typeof payload.collections === "string") {
      payload.collections = payload.collections.split(",");
    }

    if (req.file) {
      payload.images = [`/uploads/${req.file.filename}`];
    }

    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    Object.assign(product, payload);

    const { percent, finalPrice } = await computeDiscountForProduct(product);
    product.discount = percent;
    product.discountedPrice = finalPrice;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("❌ Update product failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------
   ✅ DELETE /api/products/:id
-------------------------------------------------- */
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete product failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
