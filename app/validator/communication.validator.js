const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.createAnnouncement = [
    body('title').exists(),
    body('desc').exists()
]

exports.editAnnouncement = [
    body('announcementId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.deleteAnnouncement = [
    query('announcementId').exists()
]

exports.chatAccount = [
    body('chatType').exists().custom(async value => {
        if (value != 'admin' && value != 'normal') 
            return Promise.reject('The chat type is invalid!')
    }),
    body('targetId').exists(),
    body('targetType').exists()
]

exports.sendChat = [
    body('roomId').exists(),
    body('message').exists()
]