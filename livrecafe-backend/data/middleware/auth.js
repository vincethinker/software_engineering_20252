const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: " Vui lòng đăng nhập để tiếp tục"});
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
};
}
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Từ chối truy cập: Bạn không có quyền thực hiện hành động này!" 
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
  