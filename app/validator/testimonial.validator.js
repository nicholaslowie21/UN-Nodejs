const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.getCommonProject = [
    query('accountId').exists(),
    query('accountType').exists()
]

exports.requestTestimonial = [
    body('accountId').exists(),
    body('accountType').exists(),
    body('projectId').exists()
]

