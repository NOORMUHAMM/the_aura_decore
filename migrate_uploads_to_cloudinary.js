/**
 * 🚀 Migration Script
 * Uploads all local images from /uploads to Cloudinary
 * and updates MongoDB product image URLs automatically.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const Product = require("./src/models/Product");



// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function migrateImages() {
  const uploadDir = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadDir)) {
    console.error("❌ No 'uploads' folder found. Nothing to migrate.");
    process.exit(1);
  }

  const files = fs.readdirSync(uploadDir).filter((f) => !f.startsWith("."));
  if (files.length === 0) {
    console.log("✅ No images found to migrate.");
    process.exit(0);
  }

  console.log(`🖼️ Found ${files.length} images. Starting migration...\n`);

  for (const file of files) {
    const localPath = path.join(uploadDir, file);

    try {
      // ✅ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(localPath, {
        folder: "aura_decore_products",
      });

      // ✅ Update all products using this local image path
      const dbPath = `/uploads/${file}`;
      const updated = await Product.updateMany(
        { images: dbPath },
        { $set: { images: [result.secure_url] } }
      );

      if (updated.modifiedCount > 0) {
        console.log(`✅ ${file} → ${result.secure_url}`);
      } else {
        console.log(`⚠️ ${file} uploaded but not linked to any product`);
      }
    } catch (err) {
      console.error(`❌ Error uploading ${file}:`, err.message);
    }
  }

  console.log("\n🎉 Migration completed!");
  mongoose.connection.close();
}

migrateImages();
