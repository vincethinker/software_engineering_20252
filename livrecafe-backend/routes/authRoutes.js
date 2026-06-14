const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu"
      });
    }

    const existedUser = await User.findOne({ phone });

    if (existedUser) {
      return res.status(400).json({
        message: "Số điện thoại đã được đăng ký"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phone,
      email,
      passwordHash,
      role: "customer"
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        points: user.points,
        membershipLevel: user.membershipLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đăng ký",
      error: error.message
    });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại và mật khẩu"
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "Số điện thoại hoặc mật khẩu không đúng"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Số điện thoại hoặc mật khẩu không đúng"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa"
      });
    }

    const token = createToken(user);

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        points: user.points,
        membershipLevel: user.membershipLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đăng nhập",
      error: error.message
    });
  }
});

// Lấy thông tin user hiện tại
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Chưa đăng nhập"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản"
      });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({
      message: "Token không hợp lệ"
    });
  }
});

// Làm lại mật khẩu đơn giản cho demo
router.post("/forgot-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại và mật khẩu mới"
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản"
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi làm lại mật khẩu",
      error: error.message
    });
  }
});

// Cập nhật thông tin cá nhân
router.patch("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Chưa đăng nhập"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      fullName,
      email,
      gender,
      identityNumber,
      birthday,
      city,
      district,
      ward,
      address
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        fullName,
        email,
        gender,
        identityNumber,
        birthday,
        city,
        district,
        ward,
        address
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản"
      });
    }

    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật thông tin cá nhân",
      error: error.message
    });
  }
});

module.exports = router;