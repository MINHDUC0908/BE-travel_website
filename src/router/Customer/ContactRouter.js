
const router = require("express").Router()

const contactController = require("../../app/controller/Customer/ContactController")

router.post("/contact", contactController.getContactDetails)

module.exports = router