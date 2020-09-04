const express = require('express');
const router = express.Router();
const institutionController = require('../controller/institution.controller');
const auth = require('../middleware/auth')

const InstitutionValidator = require('../validator/institution.validator');

router.post('/updateProfile', auth, InstitutionValidator.updateProfile, InstitutionValidator.ifErrors, institutionController.updateProfile);

router.post('/uploadProfilePicture', auth, institutionController.multerUpload, institutionController.profilePicture);

module.exports = router;
