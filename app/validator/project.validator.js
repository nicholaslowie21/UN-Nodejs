const { body, query, validationResult, oneOf, check } = require('express-validator');

exports.viewProject = [
    query('code').exists()
]

exports.searchProjects = [
    query('code').exists()
]