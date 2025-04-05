const express = require("express")
const router = express.Router()

const tourCategoryController = require("../../app/controller/Customer/TourCategoryController")

router.get("/", tourCategoryController.index)
router.post("/tours-by-category", tourCategoryController.getToursByCategory);
router.post("/tours-by-category/filter", tourCategoryController.filterGetToursByCategory);
module.exports = router