const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const auth = require('../middleware/auth')

const UserValidator = require('../validator/user.validator');

router.post('/updateProfile', auth, UserValidator.updateProfile, UserValidator.ifErrors, userController.updateUserProfile);

module.exports = router;
