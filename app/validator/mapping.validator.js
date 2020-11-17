const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.accountClaim = [
    body('accountId').exists(),
    body('accountType').exists(),
    body('email').exists(),
    body('password').exists(),
    body('username').exists()
]
