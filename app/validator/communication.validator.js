const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.createAnnouncement = [
    body('title').exists(),
    body('desc').exists()
]

exports.editAnnouncement = [
    body('rewardId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.deleteAnnouncement = [
    body('announcementId').exists()
]