const express = require("express")
const router = express.Router()

const tourCategoryController = require("../../app/controller/Customer/TourCategoryController")

router.get("/", tourCategoryController.index)

module.exports = router