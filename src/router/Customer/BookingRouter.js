const express = require("express")
const router = express.Router()

const bookingController = require("../../app/controller/Customer/BookingController")

router.post('/create', bookingController.bookTour)
router.get("/show/:id", bookingController.show)
module.exports = router