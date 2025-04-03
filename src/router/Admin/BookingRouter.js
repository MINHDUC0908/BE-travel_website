const express = require("express");
const router = express.Router();
const BookingController = require("../../app/controller/Admin/BookingController");

// Route lấy thông tin user (cần đăng nhập)
router.post("/", BookingController.index);
router.post("/payment_confirmation", BookingController.payment_confirmation);

module.exports = router;
