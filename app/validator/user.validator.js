const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models');
const Users = db.users;
const Institution = db.institution;
const Isemail = require('isemail');
const nodeCountries =  require("node-countries");

exports.userSignup = [
    body('name').exists(),
    body('username').exists().custom(async value => {
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
    body('password').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);

        if (!theCountry)
            return Promise.reject('Country is not valid');
    })
]

exports.userChangePassword = [
    body('password').exists()
]

exports.login = async (req, res, next) => {
    let field = req.body.usernameOrEmail;
    let password = req.body.password;

    if(!field)
        return res.status(400).json({
            status: 'error',
            msg: "Username or Email is empty!",
            data: {}
         });

    if(!password) {
        return res.status(400).json({
            status: 'error',
            msg: "Password is empty!",
            data: {}
         });
    }

    if(Isemail.validate(field)) {
        req.body.email = field;
    } else {
        req.body.username = field;
    }

    next();
}

exports.updateProfile = [
    body('name').exists(),
    body('username').exists().custom(async value => {
        let user = await Users.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        let institution = await Institution.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user || institution)
            return Promise.reject('username already exists. User profile cannot be updated');
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
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);

        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('bio').exists(),
    body('occupation').exists()
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