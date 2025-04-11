const jwt = require("jsonwebtoken");

class LoginWithGG {
    async handleGoogleCallback(req, res) {
        try {
            const user = req.user;

            const accessToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Thay đổi trong class LoginWithGG
            res.redirect(`http://localhost:5173?token=${accessToken}`);
        } catch (err) {
            console.error("Google login error:", err);
            res.status(500).json({ message: "Xác thực Google thất bại." });
        }
    }
}

module.exports = new LoginWithGG(); 