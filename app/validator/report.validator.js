const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.createReport = [
    body('title').exists(),
    body('summary').exists(),
    body('targetId').exists(),
    body('reportType').exists()
]

exports.filteredStatus = [
    query('status').exists()
]
