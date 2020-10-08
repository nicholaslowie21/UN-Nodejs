const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.reqResource = [
    body('resourceId').exists(),
    body('needId').exists(),
    body('desc').exists(),
    body('resType').exists()
]

exports.reqAutoResource = [
    body('resourceId').exists(),
    body('projectId'),
    body('desc').exists(),
    body('resType').exists()
]

exports.reqProject = [
    body('resourceId').exists(),
    body('needId').exists(),
    body('desc').exists(),
    body('resType').exists()
]

exports.contributeMoney = [
    body('needId').exists(),
    body('desc').exists(),
    body('moneySum').exists()
]

exports.useKnowledgeResource = [
    body('resourceId').exists(),
    body('needId').exists(),
    body('desc').exists()
]

exports.useAutoKnowledgeResource = [
    body('projectId').exists(),
    body('resourceId').exists(),
    body('desc').exists()
]

exports.filterProj = [
    body('filterSDGs').exists()
]

exports.getProjects = [
    query('accountId').exists(),
    query('accountType').exists()
]
