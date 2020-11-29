const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;

exports.retrieveList = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    })
]

exports.verifyInstitution = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    body('institutionId').exists()
]

exports.declineUserRequest = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    body('requestId').exists()
]