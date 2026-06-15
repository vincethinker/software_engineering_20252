const express = require("express");
const router = express.Router();
const User = require("../models/User");
const MembershipTier = require("../models/MembershipTier");
const Promotion = require("../models/Promotion");
const { verifyToken } = require("../middleware/auth");

async function updateMembershipLevel(userId, points) {
    let level = "Bronze";
    if (points >= 600) level = "Diamond";
    else if (points >= 300) level = "Gold";
    else if (points >= 100) level = "Silver";

    await User.findByIdAndUpdate(userId, { membershipLevel: level });
}

router.post("/register", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

        if (user.isLoyalMember) {
            return res.status(400).json({ message: "Bạn đã là thành viên loyal rồi" });
        }

        user.isLoyalMember = true;
        await user.save();

        res.json({ message: "Đăng ký thành viên loyal thành công", user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng ký thành viên", error: error.message });
    }
});

router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-passwordHash");
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

        const tiers = await MembershipTier.find().sort({ requiredPoints: 1 });

        res.json({
            points: user.points,
            membershipLevel: user.membershipLevel,
            tiers
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy thông tin thành viên", error: error.message });
    }
});


router.get("/promotions", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const tier = await MembershipTier.findOne({ tierName: user.membershipLevel });

        const now = new Date();

        const promotions = await Promotion.find({
            status: "active",
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { tierId: null },     
                { tierId: tier?._id }    
            ]
        });

        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy ưu đãi", error: error.message });
    }
});

module.exports = { router, updateMembershipLevel };