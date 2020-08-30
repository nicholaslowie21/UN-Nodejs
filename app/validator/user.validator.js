const { body, validationResult, oneOf, check } = require('express-validator');
const db = require('../models')
const Users = db.users;

exports.userSignup = [
    body('name').exists(),
    body('username').exists().custom(async value => {
        let user = await Users.findOne({ 'username': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user)
            return Promise.reject('username already exists. User cannot be created');
    }),
    body('email').isEmail().custom(async value => {
        let user = await Users.findOne({ 'email': value }, function (err, person) {
            if (err) return handleError(err);
          });
        if (user)
            return Promise.reject('email already exists. User cannot be created');
    }),
    body('password').exists(),
    body('country').exists()
]

exports.userLogin = [
    body('usernameOrEmail').exists(),
    body('password').exists()
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