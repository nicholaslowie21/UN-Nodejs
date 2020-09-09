const express = require('express');
const router = express.Router();
const authorizationController = require('../controller/authorization.controller');
const auth = require('../middleware/auth')

const UserValidator = require('../validator/user.validator');
const InstitutionValidator = require('../validator/institution.validator');

/* POST register user. */
router.post('/user/signup', UserValidator.userSignup, UserValidator.ifErrors, authorizationController.postSignup);

/* POST user change password. */
router.post('/user/changePassword', auth, UserValidator.userChangePassword, UserValidator.ifErrors, authorizationController.userChangePassword);

/* POST register institution. */
router.post('/institution/signup', InstitutionValidator.signUp, InstitutionValidator.ifErrors, authorizationController.postInstitutionSignup);

/* POST user change password. */
router.post('/institution/changePassword', auth, UserValidator.userChangePassword, UserValidator.ifErrors, authorizationController.institutionChangePassword);


router.post('/login', UserValidator.login, UserValidator.ifErrors, authorizationController.postLogin);


router.post('/reset-password-request', authorizationController.postChangePasswordRequest)
router.get('/reset-password-request/:token', authorizationController.getChangePassword)
router.post('/update-password', authorizationController.postUpdatePassword)

router.post('/user/verifyRequest', auth, authorizationController.multerUpload, authorizationController.verifyRequest)

// for testing purpose only
router.post('/testing', auth, authorizationController.postTest)

module.exports = router;
