const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();

function calculateEarnedPoints(amount) {
  return Math.floor(Number(amount || 0) / 10000);
}

function calculateMembershipLevel(points) {
  const totalPoints = Number(points || 0);

  if (totalPoints >= 600) return "Kim cương";
  if (totalPoints >= 300) return "Vàng";
  if (totalPoints >= 100) return "Bạc";

  return "Đồng";
}

async function addLoyaltyPoints(customerId, amount) {
  if (!customerId) return null;

  const earnedPoints = calculateEarnedPoints(amount);

  if (earnedPoints <= 0) return null;

  const user = await User.findById(customerId);

  if (!user) return null;

  const newPoints = Number(user.points || 0) + earnedPoints;
  const newMembershipLevel = calculateMembershipLevel(newPoints);

  user.points = newPoints;
  user.membershipLevel = newMembershipLevel;
  user.isLoyalMember = true;

  await user.save();

  return {
    earnedPoints,
    points: user.points,
    membershipLevel: user.membershipLevel
  };
}

router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      phone,
      email,
      customerType,
      items,
      totalAmount,
      orderType,
      paymentMethod,
      note
    } = req.body;

    if (!customerName || !phone) {
      return res.status(400).json({
        message: "Vui lòng nhập tên khách hàng và số điện thoại"
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Giỏ hàng đang trống"
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        message: "Vui lòng chọn phương thức thanh toán"
      });
    }

    const order = await Order.create({
      customerId: customerId || null,
      customerName,
      phone,
      email,
      customerType: customerType || "regular",
      items,
      totalAmount,
      orderType: orderType || "takeaway",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "unpaid" : "paid",
      status: "pending",
      isSeenByStaff: false,
      loyaltyPointsAwarded: false,
      earnedPoints: 0,
      note: note || ""
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("new-order", {
        id: order._id,
        customerName: order.customerName,
        phone: order.phone,
        customerType: order.customerType,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt
      });
    }

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tạo đơn hàng",
      error: error.message
    });
  }
});

router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({
      customerId
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy lịch sử đơn hàng",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách đơn hàng",
      error: error.message
    });
  }
});

router.get("/new-count", async (req, res) => {
  try {
    const count = await Order.countDocuments({
      status: "pending"
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đếm đơn hàng mới",
      error: error.message
    });
  }
});

router.patch("/:id/seen", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isSeenByStaff: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      message: "Đã đánh dấu đơn hàng là đã xem",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật đơn hàng",
      error: error.message
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "completed",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Trạng thái đơn hàng không hợp lệ"
      });
    }

    const oldOrder = await Order.findById(req.params.id);

    if (!oldOrder) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    const updateData = {
      status,
      isSeenByStaff: true
    };

    let loyaltyResult = null;

    if (
      status === "completed" &&
      oldOrder.status !== "completed" &&
      oldOrder.customerId &&
      oldOrder.customerType === "loyal"
    ) {
      updateData.paymentStatus = "paid";

      loyaltyResult = await addLoyaltyPoints(
        oldOrder.customerId,
        oldOrder.totalAmount
      );

      if (loyaltyResult) {
        updateData.loyaltyPointsAwarded = true;
        updateData.earnedPoints = loyaltyResult.earnedPoints;
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    const io = req.app.get("io");

    if (io) {
      io.emit("order-status-updated", {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        customerId: order.customerId,
        loyaltyResult
      });
    }

    res.json({
      message:
        status === "completed"
          ? "Đơn hàng đã hoàn thành, tự động xác nhận đã thanh toán và cộng điểm nếu là khách hàng thân thiết"
          : "Cập nhật trạng thái đơn hàng thành công",
      order,
      loyaltyResult
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật trạng thái đơn hàng",
      error: error.message
    });
  }
});

module.exports = router;