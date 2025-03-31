const express = require("express");
const router = express.Router();
const zalopayController = require("../../app/controller/Admin/ZalopayController");

router.get("/zalopay_return", zalopayController.zalopayReturn);

module.exports = router;
