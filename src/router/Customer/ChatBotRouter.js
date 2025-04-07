
const router = require('express').Router();
const ChatBox = require('../../app/controller/Customer/ChatBox');

router.post('/chatbox', ChatBox.chatBox);

module.exports = router;