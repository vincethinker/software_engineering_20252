const express = require("express");
const BookingSpace = require("../models/BookingSpace");
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

async function findLoyalUserForBooking(booking) {
  if (booking.customerId) {
    const userById = await User.findById(booking.customerId);

    if (userById) return userById;
  }

  if (booking.phone) {
    const userByPhone = await User.findOne({
      phone: booking.phone,
      role: "customer"
    });

    if (userByPhone) return userByPhone;
  }

  return null;
}

async function addLoyaltyPointsForBooking(booking) {
  const user = await findLoyalUserForBooking(booking);

  if (!user) return null;

  const amount =
    Number(booking.estimatedTotal || 0) ||
    Number(booking.menuTotal || 0) + Number(booking.spaceFee || 0);

  const earnedPoints = calculateEarnedPoints(amount);

  if (earnedPoints <= 0) return null;

  const newPoints = Number(user.points || 0) + earnedPoints;
  const newMembershipLevel = calculateMembershipLevel(newPoints);

  user.points = newPoints;
  user.membershipLevel = newMembershipLevel;
  user.isLoyalMember = true;

  await user.save();

  return {
    userId: user._id,
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
      customerId: customerId || null,
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
      paymentStatus: "unpaid",
      status: "pending",
      isSeenByStaff: false,
      loyaltyPointsAwarded: false,
      earnedPoints: 0,
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
        paymentStatus: booking.paymentStatus,
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

    const allowedStatuses = ["pending", "confirmed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Trạng thái đặt chỗ không hợp lệ"
      });
    }

    const oldBooking = await BookingSpace.findById(req.params.id);

    if (!oldBooking) {
      return res.status(404).json({
        message: "Không tìm thấy đặt chỗ"
      });
    }

    const updateData = {
      status,
      isSeenByStaff: true
    };

    let loyaltyResult = null;

    if (
      status === "confirmed" &&
      oldBooking.status !== "confirmed"
    ) {
      updateData.paymentStatus = "paid";

      loyaltyResult = await addLoyaltyPointsForBooking(oldBooking);

      if (loyaltyResult) {
        updateData.customerId = loyaltyResult.userId;
        updateData.loyaltyPointsAwarded = true;
        updateData.earnedPoints = loyaltyResult.earnedPoints;
      }
    }

    const booking = await BookingSpace.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    const io = req.app.get("io");

    if (io) {
      io.emit("booking-status-updated", {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        customerId: booking.customerId,
        loyaltyResult
      });
    }

    res.json({
      message:
        status === "confirmed"
          ? "Đặt chỗ đã xác nhận, tự động xác nhận đã thanh toán và cộng điểm nếu là khách hàng thân thiết"
          : "Cập nhật trạng thái đặt chỗ thành công",
      booking,
      loyaltyResult
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật đặt chỗ",
      error: error.message
    });
  }
});

module.exports = router;