const express = require("express");
const router = express.Router();
const UserController = require("../../app/controller/Admin/UserController");
const authMiddleware = require("../../middleware/authMiddleware");

// Route lấy thông tin user (cần đăng nhập)
router.get("/", authMiddleware, UserController.getUserInfo);
router.get("/index", authMiddleware, UserController.index);

module.exports = router;
