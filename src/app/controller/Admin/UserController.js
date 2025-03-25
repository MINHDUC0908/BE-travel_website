

class UserController {
    async getUserInfo(req, res) {
        try {
            res.json(req.user); // req.user đã có từ middleware
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }
}

module.exports = new UserController();
