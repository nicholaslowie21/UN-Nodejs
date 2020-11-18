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
router.post('/chat/read', auth, CommunicationValidator.markRead, Helper.ifErrors, communicationController.markRead)
router.get('/chat/rooms', auth, communicationController.getRoomList)
router.get('/chat/chats', auth, CommunicationValidator.getChats, Helper.ifErrors, communicationController.getChats)
router.get('/chat/filtered/rooms', auth, CommunicationValidator.getRoomLists, Helper.ifErrors, communicationController.getRoomListFiltered)

router.get('/notifications', auth, communicationController.getNotifications)

router.post('/inactiveEmail', communicationController.triggerInactiveEmail)

module.exports = router;