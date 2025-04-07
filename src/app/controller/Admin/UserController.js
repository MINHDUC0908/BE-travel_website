const User = require("../../model/User");


class UserController {
    async getUserInfo(req, res) {
        try {
            res.json(req.user); // req.user đã có từ middleware
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async index(req, res)
    {
        try {
            const users = await User.findAll({ where: { role: "user" } });
            return res.json({
                success: true,
                message: "Lấy danh sách người dùng thành công",
                data: users
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi lấy danh sách người dùng"
            });
        }
    }
}

module.exports = new UserController();
