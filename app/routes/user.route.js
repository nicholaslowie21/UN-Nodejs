const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const auth = require('../middleware/auth')

const UserValidator = require('../validator/user.validator');

router.post('/updateProfile', auth, UserValidator.updateProfile, UserValidator.ifErrors, userController.updateUserProfile);

router.post('/updateUsername', auth, UserValidator.updateUsername, UserValidator.ifErrors, userController.updateUsername );

router.post('/updateEmail', auth, UserValidator.updateEmail, UserValidator.ifErrors, userController.updateEmail )

router.post('/uploadProfilePicture', auth, userController.multerUpload, userController.profilePicture);

router.get('/currProjects', auth, userController.currProjects)

router.get('/pastProjects', auth, userController.pastProjects)

module.exports = router;
