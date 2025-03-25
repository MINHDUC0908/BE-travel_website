const express = require('express');
const router = express.Router();

const authController = require("../app/controller/Auth/Login");
const authMiddleware = require("../middleware/authMiddleware");
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken); // Thêm route cho refresh token
router.post('/logout', authMiddleware , authController.logout); // Thêm route cho refresh token
module.exports = router;
