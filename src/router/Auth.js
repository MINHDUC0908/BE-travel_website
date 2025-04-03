const express = require('express');
const router = express.Router();

const authController = require("../app/controller/Auth/Login");
const authMiddleware = require("../middleware/authMiddleware");

const verifyController = require("../app/controller/Auth/Verify")
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken); // Thêm route cho refresh token
router.post('/logout', authMiddleware , authController.logout); // Thêm route cho refresh token

// Xác thực
router.get("/verify-email/:verificationToken", verifyController.verify)
module.exports = router;
