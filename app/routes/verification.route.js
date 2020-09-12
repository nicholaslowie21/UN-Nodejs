const express = require('express');
const router = express.Router();
const verificationController = require('../controller/verification.controller');
const auth = require('../middleware/auth')

const VerificationValidator = require('../validator/verification.validator');
const Helper = require('../service/helper.service');

router.get('/institutionRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.institutionRequest );

router.get('/userRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.userRequest );


module.exports = router;
