const { body, query, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;
const Institution = db.institution;
const Isemail = require('isemail');
const nodeCountries =  require("node-countries");

exports.signUp = [
    body('name').exists(),
    body('username').exists().custom(async value => {
        value = value.toLowerCase();
        if(value.indexOf(" ")>-1) {
            return Promise.reject('username contains space! No space is allowed.')
        }
        let user = await Users.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        let institution = await Institution.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user || institution)
            return Promise.reject('username already exists. User cannot be created');
    }),
    body('email').isEmail().custom(async value => {
        let user = await Users.findOne({ 'email': value }, function (err, person) {
            if (err) return handleError(err);
          });
        let institution = await Institution.findOne({ 'email': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user || institution)
            return Promise.reject('email already exists. User cannot be created');
    }),
    body('password').exists().custom(async value => {
        
        if (value.length < 8)
            return Promise.reject('Password must be at least 8 characters');
    }),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);

        if (!theCountry)
            return Promise.reject('Country is not valid');
    })
]

exports.searchUsers = [
    // check that search key exists
    query('username').exists()
]

exports.updateProfile = [
    body('name').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);

        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('bio').exists(),
    body('phone').exists(),
    body('address').exists(),
    body('website').exists(),
    body('SDGs').exists().custom(async value => {
        let valid = true;

        value.forEach( sdg => {
            if(sdg<1 || sdg > 17) {
                valid = false;
            }
        })

        if(!valid) 
            return Promise.reject('SDGs are not valid')
    })
]

exports.updateUsername = [
    body('username').exists().custom(async value => {
        let user = await Users.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        let institution = await Institution.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user || institution)
            return Promise.reject('username already exists.');
    })
]

exports.updateEmail = [
    body('email').isEmail().custom(async value => {
        let user = await Users.findOne({ 'email': value }, function (err, person) {
            if (err) return handleError(err);
          });
        let institution = await Institution.findOne({ 'email': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user || institution)
            return Promise.reject('email already exists.');
    })
]

exports.addMember = [
    body('userId').exists()
]

exports.delMember = [
    body('userId').exists()
]

exports.viewInstitution = [
    query('username').exists()
]

exports.viewInstitutionById = [
    query('institutionId').exists()
]

exports.currProject = [
    query('institutionId').exists()
]

exports.getBadges = [
    query('accountId').exists(),
    query('accountType').exists()
]

exports.getMembers = [
    query('institutionId').exists()
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
            msg: param+": "+msg,
            param: param
        });
    }
    next();
}