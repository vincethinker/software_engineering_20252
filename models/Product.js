const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      required: true,
      enum: ["drink", "snack", "book"]
    },

    category: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    imageUrl: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    stock: {
      type: Number,
      default: 20,
      min: 0
    },

    status: {
      type: String,
      enum: ["available", "out_of_stock", "hidden"],
      default: "available"
    },

    isBestSeller: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    author: {
      type: String,
      default: ""
    },

    publisher: {
      type: String,
      default: ""
    },

    canReadAtCafe: {
      type: Boolean,
      default: false
    },

    canBuy: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);