const express = require('express');
const router = express.Router();
const authorizationController = require('../controller/authorization.controller');

const UserValidator = require('../validator/user.validator');

/* POST register user. */
router.post('/signup', UserValidator.userSignup, UserValidator.ifErrors, authorizationController.postSignup);

module.exports = router;
