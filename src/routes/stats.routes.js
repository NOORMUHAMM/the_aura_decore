// routes/stats.routes.js
const express = require("express");
const router = express.Router();
const statsCtrl = require("../controllers/stats.controller");

// Stats overview
router.get("/", statsCtrl.getStats);

// Sales trend data
router.get("/salesTrend", statsCtrl.getSalesTrend);

// Products grouped by category
router.get("/productsByCategory", statsCtrl.getProductsByCategory);

module.exports = router;
