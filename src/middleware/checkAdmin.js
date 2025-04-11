

// Middleware kiểm tra quyền Admin
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "🚫 Không có quyền truy cập!" });
    }
    next();
};

module.exports = authorizeAdmin 