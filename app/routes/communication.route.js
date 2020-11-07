const express = require('express');
const router = express.Router();
const communicationController = require('../controller/communication.controller');
const auth = require('../middleware/auth')

const CommunicationValidator = require('../validator/communication.validator');
const Helper = require('../service/helper.service');

router.post('/createAnnouncement', auth, CommunicationValidator.createAnnouncement, Helper.ifErrors, communicationController.createAnnouncement);
router.post('/editAnnouncement', auth, CommunicationValidator.editAnnouncement, Helper.ifErrors, communicationController.editAnnouncement)
router.delete('/deleteAnnouncement', auth, CommunicationValidator.deleteAnnouncement, Helper.ifErrors, communicationController.deleteAnnouncement)
router.get('/announcement', auth, communicationController.getAnnouncement)

router.post('/chat/chatAccount', auth, CommunicationValidator.chatAccount, Helper.ifErrors, communicationController.chatAccount)
router.post('/chat/send', auth, CommunicationValidator.sendChat, Helper.ifErrors, communicationController.sendChat)


module.exports = router;