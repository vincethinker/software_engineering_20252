const mongoose = require("mongoose");

const membershipTierSchema = new mongoose.Schema(
    {
        tierName: { type: String, required: true, trim: true },
        requiredPoints: { type: Number, required: true, min: 0 },
        benefitDescription: { type: String, default: "" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MembershipTier", membershipTierSchema);