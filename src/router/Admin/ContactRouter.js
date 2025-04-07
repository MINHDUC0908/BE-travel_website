
const express = require('express');
const router = express.Router();
const contactController = require('../../app/controller/Admin/ContactController');

router.get('/', contactController.index);
router.post('/reply', contactController.sendReply);


module.exports = router;