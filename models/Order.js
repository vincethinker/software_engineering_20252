const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["drink", "snack", "book"],
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    imageUrl: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    customerName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    orderType: {
      type: String,
      enum: ["takeaway", "dine_in"],
      default: "takeaway"
    },

    paymentMethod: {
      type: String,
      enum: ["bank", "cash"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid"
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "completed", "cancelled"],
      default: "pending"
    },

    isSeenByStaff: {
      type: Boolean,
      default: false
    },

    loyaltyPointsAwarded: {
  type: Boolean,
  default: false
    },

    earnedPoints: {
  type: Number,
  default: 0
    },

    note: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);