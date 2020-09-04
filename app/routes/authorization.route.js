const express = require('express');
const router = express.Router();
const authorizationController = require('../controller/authorization.controller');
const auth = require('../middleware/auth')

const UserValidator = require('../validator/user.validator');

/* POST register user. */
router.post('/user/signup', UserValidator.userSignup, UserValidator.ifErrors, authorizationController.postSignup);

router.post('/login', UserValidator.login, UserValidator.ifErrors, authorizationController.postLogin);

// for testing purpose only
router.post('/testing', auth, authorizationController.postTest)

module.exports = router;
