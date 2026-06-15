const express = require("express");
const BookingSpace = require("../models/BookingSpace");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      eventName,
      eventType,
      eventDate,
      eventTime,
      participantCount,
      duration,
      selectedMenu,
      spaceFee,
      menuTotal,
      estimatedTotal,
      note
    } = req.body;

    if (!customerName || !phone || !email) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email"
      });
    }

    if (!eventName || !eventType || !eventDate || !eventTime || !duration) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin sự kiện"
      });
    }

    if (!participantCount || Number(participantCount) <= 0) {
      return res.status(400).json({
        message: "Số người tham gia phải lớn hơn 0"
      });
    }

    if (!selectedMenu || !Array.isArray(selectedMenu) || selectedMenu.length === 0) {
      return res.status(400).json({
        message: "Vui lòng chọn ít nhất một món đồ ăn hoặc đồ uống"
      });
    }

    const booking = await BookingSpace.create({
      customerName,
      phone,
      email,
      eventName,
      eventType,
      eventDate,
      eventTime,
      participantCount: Number(participantCount),
      duration,
      selectedMenu: selectedMenu.map((item) => ({
        productId: item._id || item.productId || null,
        name: item.name,
        type: item.type,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || ""
      })),
      spaceFee: Number(spaceFee) || 0,
      menuTotal: Number(menuTotal) || 0,
      estimatedTotal: Number(estimatedTotal) || 0,
      status: "pending",
      isSeenByStaff: false,
      note: note || ""
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("new-booking", {
        id: booking._id,
        customerName: booking.customerName,
        phone: booking.phone,
        eventName: booking.eventName,
        eventDate: booking.eventDate,
        eventTime: booking.eventTime,
        participantCount: booking.participantCount,
        estimatedTotal: booking.estimatedTotal,
        status: booking.status,
        createdAt: booking.createdAt
      });
    }

    res.status(201).json({
      message: "Đặt chỗ thành công",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tạo đặt chỗ",
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

    const bookings = await BookingSpace.find(filter).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách đặt chỗ",
      error: error.message
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await BookingSpace.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isSeenByStaff: true
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        message: "Không tìm thấy đặt chỗ"
      });
    }

    res.json({
      message: "Cập nhật trạng thái đặt chỗ thành công",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật đặt chỗ",
      error: error.message
    });
  }
});

module.exports = router;