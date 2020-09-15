const { body, query, validationResult, oneOf, check } = require('express-validator');

exports.viewResource = [
    query('userId').exists()
]

exports.viewInstitutionResource = [
    query('institutionId').exists()
]