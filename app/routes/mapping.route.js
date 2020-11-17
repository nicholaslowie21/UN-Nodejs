const express = require('express');
const router = express.Router();
const mappingController = require('../controller/mapping.controller');
const auth = require('../middleware/auth')

const MappingValidator = require('../validator/mapping.validator');
const Helper = require('../service/helper.service');

router.post('/csv/users', mappingController.csvUser, mappingController.addUserCSV)
router.post('/csv/institutions', mappingController.csvInstitution, mappingController.addInstitutionCSV)

router.post('/claim', mappingController.claimUpload, MappingValidator.accountClaim, mappingController.accountClaim )

router.get('/users', mappingController.getUsers)
router.get('/institutions', mappingController.getInstitutions)

module.exports = router;
