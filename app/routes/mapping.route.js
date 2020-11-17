const express = require('express');
const router = express.Router();
const mappingController = require('../controller/mapping.controller');
const auth = require('../middleware/auth')

const TargetValidator = require('../validator/target.validator');
const Helper = require('../service/helper.service');

router.post('/csv/users', mappingController.csvUser, mappingController.addUserCSV)
router.post('/csv/institutions', mappingController.csvInstitution, mappingController.addInstitutionCSV)

module.exports = router;
