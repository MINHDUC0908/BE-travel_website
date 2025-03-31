const express = require("express");
const router = express.Router();
const vnpayController = require("../../app/controller/Admin/VnpayController");

router.post("/create_payment", vnpayController.createPaymentUrl);
router.get("/vnpay_return", vnpayController.paymentReturn);

module.exports = router;
