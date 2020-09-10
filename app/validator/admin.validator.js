const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;
const Institution = db.institution;

exports.searchUsersToPromote = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check that search key exists
    body('username').exists()
]

exports.promoteToRegionalAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check if the user to be promoted is already a regional admin or higher
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'regionalAdmin' || target.role == 'admin' || target.role == 'adminLead')
            return Promise.reject('This user is already a regional admin or higher!')
    })
]

exports.promoteToAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check if the user to be promoted is already an admin or higher
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'admin' || target.role == 'adminLead')
            return Promise.reject('This user is already an admin or higher!')
    })
]

exports.promoteToAdminLead = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to promote users!')
    }),
    // check if the user to be promoted is already an admin lead
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'adminLead')
            return Promise.reject('This user is already an admin lead!')
    })
]

exports.demoteRegionalAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to demote users!')
    }),
    // check if the user to be demoted is a regional admin to begin with
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'user' || target.role == 'admin' || target.role == 'adminLead')
            return Promise.reject('This user is not a regional admin!')
    })
]

exports.demoteAdmin = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to demote users!')
    }),
    // check if the user to be demoted is an admin to begin with
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'user' || target.role == 'regionalAdmin' || target.role == 'adminLead')
            return Promise.reject('This user is not an admin!')
    })
]

exports.demoteAdminLead = [
    // check that the user performing this action is an admin lead
    body('role').exists().custom(async value => {
        if (value != 'adminLead') 
            return Promise.reject('You are not authorised to demote users!')
    }),
    // check if the user to be demoted is an admin lead to begin with
    body('targetId').exists().custom(async value => {
        let target = await Users.findOne({ '_id': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (target.role == 'user' || target.role == 'regionalAdmin' || target.role == 'admin')
            return Promise.reject('This user is not an admin lead!')
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
            msg: msg,
            param: param
        });
    }
    next();
}