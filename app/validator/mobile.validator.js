const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.institutionChoice = [
    body('institutionId').exists()
]

exports.addContact = [
    body('qrhash').exists()
]

exports.deleteContact = [
    body('cardId').exists()
]