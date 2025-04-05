const express = require("express")
const router = express.Router()

const { ratingController, upload} = require("../../app/controller/Customer/RatingController")

const authMiddleware = require("../../middleware/authMiddleware");
router.post('/store' , authMiddleware, upload.single("image"),ratingController.store)
router.post('/', ratingController.index)

module.exports = router