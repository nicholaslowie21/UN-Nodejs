const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.reqResource = [
    body('resourceId').exists(),
    body('needId').exists(),
    body('desc').exists(),
    body('resType').exists()
]

exports.reqProject = [
    body('resourceId').exists(),
    body('needId').exists(),
    body('desc').exists(),
    body('resType').exists()
]

exports.useKnowledgeResource = [
    body('resourceId').exists(),
    body('needId').exists(),
    body('desc').exists()
]

exports.filterProj = [
    body('filterSDGs').exists()
]