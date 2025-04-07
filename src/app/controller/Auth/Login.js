const User = require("../../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../../mail/mailer");
const { getIo } = require("../../../config/socket");

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password, confirmPassword } = req.body;
            
            // Kiểm tra dữ liệu đầu vào
            if (!email)
            {
                return res.status(400).json({ message: "Email không được để trống!" });
            }
            
            if (!password) 
            {
                return res.status(400).json({ message: "Mật khẩu không được để trống!" });
            }
            
            // Kiểm tra xác nhận mật khẩu
            if (password !== confirmPassword) 
            {
                return res.status(400).json({ message: "Mật khẩu nhập lại không khớp!" });
            }
            
            // Kiểm tra email đã tồn tại chưa
            const isEmail = await User.findOne({ where: { email } });
            if (isEmail) {
                return res.status(400).json({ message: "Email đã tồn tại trong hệ thống!" });
            }
            
            const verificationToken  = crypto.randomBytes(32).toString("hex")
            // Tạo user mới (chỉ truyền các trường cần thiết)
            const user = await User.create({
                name,
                email,
                password,
                verificationToken: verificationToken
            });
            
            await sendVerificationEmail(email, verificationToken)
            return res.status(201).json({
                success: true,
                message: "Đăng kí tài khoản thành công",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            console.error("Lỗi đăng kí:", error);
            return res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(400).json({ message: "Email không tồn tại!" });
            }

            // Sử dụng phương thức comparePassword từ model User
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu không đúng!" });
            }

            // Tạo Access Token
            const accessToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES } // Token sống trong thời gian quy định
            );

            // Tạo Refresh Token
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" } // Token sống trong 7 ngày
            );

            // Lưu refreshToken vào HTTP-Only Cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Bật HTTPS trong môi trường production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            // Gửi thông báo qua socket về trạng thái user
            const io = getIo();
            io.emit('userStatus', {
                userId: user.id,
                status: 'online'
            });

            res.json({
                message: "Đăng nhập thành công!",
                accessToken,
                data: { id: user.id, name: user.name, email: user.email, role: user.role }
            });

        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ message: "Không có refresh token!" });
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ message: "Refresh token không hợp lệ!" });
                }

                // Kiểm tra người dùng có tồn tại không
                const user = await User.findOne({ where: { id: decoded.id } });
                if (!user) {
                    return res.status(404).json({ message: "Người dùng không tồn tại!" });
                }

                // Tạo Access Token mới
                const newAccessToken = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES || "15m" }
                );

                res.json({ accessToken: newAccessToken });
            });

        } catch (error) {
            console.error("Lỗi refresh token:", error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async logout(req, res) {
        try {
            const userId = req.user.id; // Lấy từ middleware auth
            const io = getIo();
            
            io.emit('userStatus', {
                userId,
                status: 'offline'
            });

            // Xóa cookie chứa refreshToken
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            res.json({ message: "Đăng xuất thành công!" });

        } catch (error) {
            console.error("Lỗi logout:", error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }
}

module.exports = new AuthController();