const express = require("express")
const router = express.Router()

const { upload, imageController} = require("../../app/controller/Admin/ImageController")

router.delete("/delete/:id", imageController.delete)
router.post("/store", upload.single("image_url"), imageController.store)
module.exports = router