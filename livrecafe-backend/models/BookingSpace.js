const mongoose = require("mongoose");

const bookingMenuItemSchema = new mongoose.Schema(
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

const bookingSpaceSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true
    },

    eventName: {
      type: String,
      required: true,
      trim: true
    },

    eventType: {
      type: String,
      required: true
    },

    eventDate: {
      type: String,
      required: true
    },

    eventTime: {
      type: String,
      required: true
    },

    participantCount: {
      type: Number,
      required: true,
      min: 1
    },

    duration: {
      type: String,
      required: true
    },

    selectedMenu: [bookingMenuItemSchema],

    spaceFee: {
      type: Number,
      default: 0
    },

    menuTotal: {
      type: Number,
      default: 0
    },

    estimatedTotal: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    },

    isSeenByStaff: {
      type: Boolean,
      default: false
    },

    note: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingSpace", bookingSpaceSchema);