const express = require('express');
const router = express.Router();

const authController = require("../app/controller/Auth/Login");
const authMiddleware = require("../middleware/authMiddleware");
const loginWithGGController = require("../app/controller/Auth/LoginWithGG")

const verifyController = require("../app/controller/Auth/Verify");
const passport = require("../config/passport"); // Import passport
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken); // Thêm route cho refresh token
router.post('/logout', authMiddleware , authController.logout); // Thêm route cho refresh token



router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));
// Xử lý redirect từ Google về
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    loginWithGGController.handleGoogleCallback
);

// Xác thực
router.get("/verify-email/:verificationToken", verifyController.verify)
module.exports = router;
