const express = require('express');
const router = express.Router();
const reportController = require('../controller/report.controller');
const auth = require('../middleware/auth')

const ReportValidator = require('../validator/report.validator');
const Helper = require('../service/helper.service');

router.post('/', auth, ReportValidator.createReport, Helper.ifErrors, reportController.createReport)
router.get('/filtered/status', auth, ReportValidator.filteredStatus, reportController.filteredStatus)

/*
router.post('/institutionChoice', auth, MobileValidator.institutionChoice, Helper.ifErrors, mobileController.institutionChoice )
router.delete('/institutionChoice', auth, mobileController.deleteInsitutionChoice )
router.post('/addContact', auth, MobileValidator.addContact, Helper.ifErrors, mobileController.addContact )
router.post('/deleteContact', auth, MobileValidator.deleteContact, Helper.ifErrors, mobileController.deleteContact )
router.get('/contactList', auth, mobileController.contactList)
*/

module.exports = router;
