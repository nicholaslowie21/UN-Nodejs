const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;

exports.retrieveList = [
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to retrieve this list!')
    })
]

exports.verifyInstitution = [
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to retrieve this list!')
    }),
    body('institutionId').exists()
]

exports.declineUserRequest = [
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to retrieve this list!')
    }),
    body('requestId').exists()
]