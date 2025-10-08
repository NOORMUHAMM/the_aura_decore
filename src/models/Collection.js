const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Support multiple images (array), but usually one is enough
    image: {
      type: String, // stores relative path like "/uploads/xyz.jpg"
      default: "",
    },

    // Optional: track active/inactive collections
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", CollectionSchema);
