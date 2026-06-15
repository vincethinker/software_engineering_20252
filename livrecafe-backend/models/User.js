const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer"
    },

    points: {
      type: Number,
      default: 0
    },

    membershipLevel: {
      type: String,
      default: "Đồng"
    },

    isLoyalMember: {
  type: Boolean,
  default: true
    },

    isActive: {
      type: Boolean,
      default: true
    },
    gender: {
  type: String,
  default: ""
    },

    identityNumber: {
  type: String,
  default: ""
    },

    birthday: {
  type: String,
  default: ""
    },

    city: {
  type: String,
  default: ""
    },

    district: {
  type: String,
  default: ""
    },

    ward: {
  type: String,
  default: ""
    },

    address: {
  type: String,
  default: ""
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);