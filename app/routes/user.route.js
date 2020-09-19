const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const auth = require('../middleware/auth')

const UserValidator = require('../validator/user.validator');

router.post('/updateProfile', auth, UserValidator.updateProfile, UserValidator.ifErrors, userController.updateUserProfile);

// router.post('/updateUsername', auth, UserValidator.updateUsername, UserValidator.ifErrors, userController.updateUsername );

router.post('/updateEmail', auth, UserValidator.updateEmail, UserValidator.ifErrors, userController.updateEmail )

router.post('/uploadProfilePicture', auth, userController.multerUpload, userController.profilePicture);

router.get('/currProjects', UserValidator.currProject, UserValidator.ifErrors, userController.currProjects)

router.get('/pastProjects', UserValidator.currProject, UserValidator.ifErrors, userController.pastProjects)

router.get('/viewUser', UserValidator.viewUser, UserValidator.ifErrors , userController.viewUser)

router.get('/badges', UserValidator.getBadges, UserValidator.ifErrors, userController.getBadges)

router.get('/affiliations', UserValidator.getAffiliations, UserValidator.ifErrors, userController.getAffiliations)

router.get('/shareProfile', auth, userController.shareProfile)

module.exports = router;
