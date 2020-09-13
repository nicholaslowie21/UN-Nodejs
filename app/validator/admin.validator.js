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

exports.suspendUser = [
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to retrieve this list!')
    }),
    body('targetId').exists()
]

exports.suspendProject = [
    body('role').exists().custom(async value => {
        if (value == 'user') 
            return Promise.reject('You are not authorised to retrieve this list!')
    }),
    body('targetId').exists()
]

exports.retrieveListValidator = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    })
]

exports.assignRegionalAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check if the user to be promoted is already a regional admin or higher
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'regionaladmin')
            return Promise.reject('This user is already a regional admin!')
    })
]

exports.assignAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check if the user to be promoted is already an admin or higher
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'admin')
            return Promise.reject('This account is already an admin!')
    })
]

exports.assignAdminLead = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check if the user to be promoted is already an admin lead
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'adminlead')
            return Promise.reject('This user is already an admin lead!')
    })
]

exports.assignUser = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminlead') 
            return Promise.reject('You are not authorised to demote users!')
    }),
    // check if the user to be demoted is a regional admin to begin with
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'user')
            return Promise.reject('This account is already a user!')
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