const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Chưa đăng nhập hoặc thiếu token"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Token không hợp lệ"
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa"
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn"
    });
  }
}

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        message: "Chưa đăng nhập"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập chức năng này"
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};