const express = require("express")
const router = express.Router()

const scheduleController = require("../../app/controller/Admin/ScheduleController")

router.put("/update/:id", scheduleController.update)

module.exports = router