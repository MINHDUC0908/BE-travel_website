const express = require("express")
const router = express.Router()

const { tourCategoryController, upload} = require("../../app/controller/Admin/TourCategoryCategory")

router.get("/", tourCategoryController.index),
router.post("/store", upload.single("image_url"), tourCategoryController.store)
module.exports = router