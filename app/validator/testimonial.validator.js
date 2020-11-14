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

exports.updateMyTestimonial = [
    body('testimonialId').exists(),
    body('status').exists().custom(async value => {
        if(value != "open" && value != "close" && value != "dismissed" && value != "canceled")
            return Promise.reject('status is invalid!')
    })
]

exports.updateOutgoingTestimonial = [
    body('testimonialId').exists(),
    body('status').exists().custom(async value => {
        if(value != "pending" && value != "dismissed" && value != "close")
            return Promise.reject('status is invalid!')
    }),
    body('desc').exists()
]

exports.getTestimonial = [
    query('status').exists()
]
