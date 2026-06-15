const express = require("express");
const Booking = require("../models/Booking");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/bookings-space", verifyToken, async (req, res) => {
    try {
        const customerId = req.user.id;
        const bookingData = {
            ...req.body,
            customerId,
            status: "pending" 
        };

        const newBooking = await Booking.create(bookingData);
        res.status(201).json({ message: "Yêu cầu đặt chỗ đã được gửi", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Lỗi gửi yêu cầu đặt chỗ", error: error.message });
    }
});