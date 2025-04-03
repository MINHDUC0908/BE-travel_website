const express = require("express")
const router = express.Router()

const tourController = require("../../app/controller/Customer/TourController")

router.get("/", tourController.index)
router.post("/filter", tourController.filter)
router.get("/show/:id", tourController.show)
module.exports = router