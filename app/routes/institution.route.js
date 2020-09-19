const express = require('express');
const router = express.Router();
const institutionController = require('../controller/institution.controller');
const auth = require('../middleware/auth')

const InstitutionValidator = require('../validator/institution.validator');

router.post('/updateProfile', auth, InstitutionValidator.updateProfile, InstitutionValidator.ifErrors, institutionController.updateProfile);

// router.post('/updateUsername', auth, InstitutionValidator.updateUsername, InstitutionValidator.ifErrors, institutionController.updateUsername );

router.post('/updateEmail', auth, InstitutionValidator.updateEmail, InstitutionValidator.ifErrors, institutionController.updateEmail )

router.post('/uploadProfilePicture', auth, institutionController.multerUpload, institutionController.profilePicture);

router.get('/getMembers', auth, InstitutionValidator.getMembers, InstitutionValidator.ifErrors ,institutionController.getMembers)

router.post('/addMember', auth, InstitutionValidator.addMember, InstitutionValidator.ifErrors ,institutionController.addMembers )

router.post('/delMember', auth, InstitutionValidator.delMember, InstitutionValidator.ifErrors, institutionController.delMembers)

router.get('/currProjects', InstitutionValidator.currProject, InstitutionValidator.ifErrors, institutionController.currProjects)

router.get('/pastProjects', InstitutionValidator.currProject, InstitutionValidator.ifErrors, institutionController.pastProjects)

router.post('/membersCSV', auth, institutionController.csvMulter, institutionController.membersCSVProcessing);

router.get('/viewInstitution', InstitutionValidator.viewInstitution , InstitutionValidator.ifErrors, institutionController.viewInstitution)

router.get('/badges', auth, InstitutionValidator.currProject, InstitutionValidator.ifErrors, institutionController.getBadges)

router.get('/searchUsers', auth, InstitutionValidator.searchUsers, InstitutionValidator.ifErrors, institutionController.searchUsers)

router.get('/shareProfile', auth, institutionController.shareProfile)

module.exports = router;
