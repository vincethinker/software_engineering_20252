const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      phone,
      email,
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
      items,
      totalAmount,
      orderType: orderType || "takeaway",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "unpaid" : "paid",
      status: "pending",
      isSeenByStaff: false,
      note: note || ""
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("new-order", {
        id: order._id,
        customerName: order.customerName,
        phone: order.phone,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
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
      status: "pending",
      isSeenByStaff: false
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

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isSeenByStaff: true
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật trạng thái đơn hàng",
      error: error.message
    });
  }
});

module.exports = router;