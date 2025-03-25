const express = require("express")
const router = express.Router()

const { tourController, upload } = require("../../app/controller/Admin/TourController")

router.post("/store", upload.array("image_url", 10), tourController.store)
router.get("/show/:id", tourController.show)
router.delete("/delete/:id", tourController.detroy)
router.put("/update/:id", tourController.update)
router.get("/index", tourController.index)
// router.post("/storeImage", upload.single("image_url"), tourController.storeImage);
module.exports = router