const { body, query, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;
const Institution = db.institution;

exports.searchUsers = [
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to access this!')
    }),
    // check that search key exists
    query('username').exists()
]

exports.allProjects = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    })
]

exports.suspendUser = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    body('targetId').exists()
]

exports.getAuditLogs = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    query('targetId').exists(),
    query('targetType').exists().custom(async value => {
        if (value != 'project' && value != 'institution' && value != 'user' && value !='reward' && value !='admin') 
            return Promise.reject('targetType is invalid!')
    })
]

exports.getAccountClaims = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    query('status').exists()
]

exports.validateAccountClaim = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    body('action').exists().custom(async value => {
        if (value != 'accepted' && value != 'declined' ) 
            return Promise.reject('Action invalid!')
    }),
    body('claimId').exists()
]

exports.suspendProject = [
    body('role').exists().custom(async value => {
        if (value != 'admin' && value != 'adminlead' && value != 'regionaladmin') 
            return Promise.reject('You are not authorised to perform this action!')
    }),
    body('targetId').exists()
]

exports.retrieveListValidator = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to retrieve this list!')
    })
]

exports.assignRegionalAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    })
]

exports.assignAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    })
]

exports.assignAdminLead = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    })
]

exports.assignUser = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to demote users!')
    })
]

// to process error from built-in express check
exports.ifErrors = (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorsArr = errors.array();
        let msg = "";
        let param = "";
        if (errorsArr[0].nestedErrors) {
            if (errorsArr[0].nestedErrors.length > 0) {
                msg = errorsArr[0].nestedErrors[0].msg;
                param = errorsArr[0].nestedErrors[0].param;

            }
        } else {
            msg = errorsArr[0].msg;
            param = errorsArr[0].param;

        }


        return res.status(422).json({
            status: 'error',
            msg: param+': '+msg ,
            param: param
        });
    }
    next();
}