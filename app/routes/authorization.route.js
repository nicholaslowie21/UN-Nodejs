const express = require('express');
const router = express.Router();
const authorizationController = require('../controller/authorization.controller');
const auth = require('../middleware/auth')

const UserValidator = require('../validator/user.validator');

/* POST register user. */
router.post('/signup', UserValidator.userSignup, UserValidator.ifErrors, authorizationController.postSignup);

router.post('/login', UserValidator.userLogin, UserValidator.ifErrors, authorizationController.postLogin);

router.post('/testing', auth, authorizationController.postTest)

module.exports = router;
