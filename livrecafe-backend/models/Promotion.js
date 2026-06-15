const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
    {
        promotionName: { type: String, required: true, trim: true },
        tierId: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipTier", default: null },
        discountType: {
            type: String,
            required: true,
            enum: ["percent", "fixed"] // percent: giảm %, fixed: giảm số tiền cố định
        },
        discountValue: { type: Number, required: true, min: 0 },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);