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

function formatUser(user) {
  return {
    id: user._id,
    _id: user._id,
    fullName: user.fullName || "",
    phone: user.phone || "",
    email: user.email || "",
    gender: user.gender || "",
    identityNumber: user.identityNumber || "",
    birthday: user.birthday || "",
    city: user.city || "",
    district: user.district || "",
    ward: user.ward || "",
    address: user.address || "",
    role: user.role,
    points: user.points,
    membershipLevel: user.membershipLevel,
    isActive: user.isActive
  };
}

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, identityNumber, password } = req.body;

    if (!fullName || !phone || !identityNumber || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại, CCCD và mật khẩu"
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
      identityNumber,
      passwordHash,
      role: "customer"
    });

    const token = createToken(user);

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: formatUser(user)
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
      user: formatUser(user)
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

    res.json(formatUser(user));
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
      phone,
      email,
      gender,
      identityNumber,
      birthday,
      city,
      district,
      ward,
      address
    } = req.body;

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập họ tên"
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại"
      });
    }

    if (!identityNumber || !String(identityNumber).trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập số CMND/CCCD"
      });
    }

    const existedPhoneUser = await User.findOne({
      phone,
      _id: { $ne: decoded.id }
    });

    if (existedPhoneUser) {
      return res.status(400).json({
        message: "Số điện thoại đã được tài khoản khác sử dụng"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        fullName,
        phone,
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
      user: formatUser(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật thông tin cá nhân",
      error: error.message
    });
  }
});

module.exports = router;