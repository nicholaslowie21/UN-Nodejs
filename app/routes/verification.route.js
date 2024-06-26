const express = require('express');
const router = express.Router();
const verificationController = require('../controller/verification.controller');
const auth = require('../middleware/auth')

const VerificationValidator = require('../validator/verification.validator');
const Helper = require('../service/helper.service');

router.get('/institutionRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.institutionRequest );

router.get('/userRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.userRequest );

router.post('/verifyInstitution', auth, VerificationValidator.verifyInstitution, Helper.ifErrors, verificationController.verifyInstitution );

router.post('/rejectInstitution', auth, VerificationValidator.verifyInstitution, Helper.ifErrors, verificationController.rejectInstitution );

router.post('/acceptUserRequest', auth, VerificationValidator.declineUserRequest, Helper.ifErrors, verificationController.acceptUserRequest);

router.post('/declineUserRequest', auth, VerificationValidator.declineUserRequest, Helper.ifErrors, verificationController.declineUserRequest );

router.get('/institutionRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.institutionRequest );

router.get('/regional/userRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.userRequestRegional );

router.get('/regional/institutionRequest', auth, VerificationValidator.retrieveList, Helper.ifErrors, verificationController.institutionRequestRegional );

module.exports = router;
