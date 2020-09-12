const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;

exports.retrieveList = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to retrieve this list!')
    })
]