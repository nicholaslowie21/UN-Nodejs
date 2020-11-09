const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.createReport = [
    body('title').exists(),
    body('summary').exists(),
    body('targetId').exists(),
    body('reportType').exists()
]

exports.updateReport = [
    body('reportId').exists(),
    body('status').exists().custom(async value => {
        if(value != 'pending' && value != 'progress' && value != 'solved' && value != 'declined') 
            return Promise.reject('status is invalid')
    })
]

exports.filteredStatus = [
    query('status').exists()
]

exports.reportDetail = [
    query('reportId').exists()
]

exports.filteredStatus = [
    query('status').exists(),
    query('country').exists()
]