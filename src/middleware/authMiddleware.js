const jwt = require("jsonwebtoken");
const User = require("../app/model/User");


const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: ["id", "name", "email", "role"],
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ!" });
    }
};

module.exports = authMiddleware;
