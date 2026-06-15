const express = require("express");
const router = express.Router();
const Order = require("../models/Orders");
const Product = require("../models/Product");
const User = require("../models/User");
const BookingSpace = require("../models/BookingSpace");
const MembershipTier = require("../models/MembershipTier");
const Promotion = require("../models/Promotion");

const { verifyToken, requireRole } = require("../middleware/auth");

router.use(verifyToken, requireRole("admin", "staff"));

// xem đơn hàng
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customerId", "fullName phone email")
            .populate("items.productId", "name price")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng", error: error.message });
    }
});
// chi tiết 1 đơn
router.get("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customerId", "fullName phone email");
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy đơn hàng", error: error.message });
    }
});

// cập nhật trạng thái đơn
router.patch("/orders/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["Chờ thanh toán", "Đơn hàng mới", "Đang xử lý", "Đang giao", "Hoàn thành", "Hủy"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json({ message: "Cập nhật trạng thái thành công", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái", error: error.message });
    }
});

// thêm sp mơi
router.post("/products", async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: "Thêm sản phẩm thành công", product });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm sản phẩm", error: error.message });
    }
});
// sửa sp
router.patch("/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.json({ message: "Cập nhật sản phẩm thành công", product });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
    }
});

// ẩn/hiện sp
router.patch("/products/:id/status", async (req, res) => {
    try {
        const { isActive } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.json({ message: "Cập nhật trạng thái sản phẩm thành công", product });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái", error: error.message });
    }
});

// xem dsach user
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
    }
});

// Khóa/mở tài khoản
router.patch("/users/:id/status", async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select("-passwordHash");
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.json({ message: "Cập nhật trạng thái tài khoản thành công", user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật tài khoản", error: error.message });
    }
});

// Xem tất cả booking
router.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách đặt chỗ", error: error.message });
    }
});

// Cập nhật trạng thái booking
router.get("/bookings", async (req, res) => {
    try {
        const bookings = await BookingSpace.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách đặt chỗ", error: error.message });
    }
});

router.patch("/bookings/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["pending", "confirmed", "cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }
        const booking = await BookingSpace.findByIdAndUpdate(
            req.params.id,
            { status, isSeenByStaff: true }, 
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Không tìm thấy đặt chỗ" });
        res.json({ message: "Cập nhật trạng thái thành công", booking });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái", error: error.message });
    }
});
// xem tier
router.get("/tiers", async (req, res) => {
    try {
        const tiers = await MembershipTier.find().sort({ requiredPoints: 1 });
        res.json(tiers);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách tier", error: error.message });
    }
});
// Thêm tier mới
router.post("/tiers", async (req, res) => {
    try {
        const tier = await MembershipTier.create(req.body);
        res.status(201).json({ message: "Thêm tier thành công", tier });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm tier", error: error.message });
    }
});
// Sửa tier
router.patch("/tiers/:id", async (req, res) => {
    try {
        const tier = await MembershipTier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!tier) return res.status(404).json({ message: "Không tìm thấy tier" });
        res.json({ message: "Cập nhật tier thành công", tier });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật tier", error: error.message });
    }
});
// Xem tất cả promotion
router.get("/promotions", async (req, res) => {
    try {
        const promotions = await Promotion.find()
            .populate("tierId", "tierName")
            .sort({ createdAt: -1 });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách ưu đãi", error: error.message });
    }
});
// Thêm promotion
router.post("/promotions", async (req, res) => {
    try {
        const promotion = await Promotion.create(req.body);
        res.status(201).json({ message: "Thêm ưu đãi thành công", promotion });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ưu đãi", error: error.message });
    }
});
// Sửa promotion
router.patch("/promotions/:id", async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!promotion) return res.status(404).json({ message: "Không tìm thấy ưu đãi" });
        res.json({ message: "Cập nhật ưu đãi thành công", promotion });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật ưu đãi", error: error.message });
    }
});
// Xem loyal members
router.get("/loyal-members", async (req, res) => {
    try {
        const members = await User.find({ isLoyalMember: true })
            .select("-passwordHash")
            .sort({ points: -1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách thành viên", error: error.message });
    }
});
module.exports = router;