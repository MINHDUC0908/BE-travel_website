const express = require('express');
const router = express.Router();
const messageController = require('../app/controller/Auth/MessageController');

router.get('/', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.put('/read/:messageId', messageController.markAsRead);

module.exports = router;